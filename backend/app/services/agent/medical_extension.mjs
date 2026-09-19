/**
 * Medical Platform Copilot Extension for Pi (@earendil-works/pi-coding-agent)
 * Registers clinical tools:
 * 1. list_patient_ct_scans: Find all CT scans for the patient to allow intelligent LLM selection
 * 2. get_patient_records: Retrieve patient clinical records, medical history, lab results
 * 3. get_segmentation_qc: Retrieve 3D segmented organ volumes, lesion metrics, quality control
 * 4. draft_radiology_report: Generate structured radiology report draft for 1-click fill
 * 5. talk_to_ct: Special skill powered by local RadSight-8B multimodal microservice (:8001)
 * 6. draft_treatment_plan: Physician-review treatment plan grounded in tools, not templates
 */

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";
const RADSIGHT_URL = process.env.RADSIGHT_URL || "http://127.0.0.1:8001";
const LLM_BASE_URL = process.env.AGENT_LLM_BASE_URL || "http://127.0.0.1:8133/v1";
const LLM_API_KEY = process.env.AGENT_LLM_API_KEY || "ydy2837465#";
const LLM_MODEL = process.env.AGENT_LLM_MODEL || "Qwen3.8-Flash-Next-MLX-oQ6-MTP";

export default function medicalExtension(pi) {
  // Register custom OpenAI-compatible backend LLM provider
  pi.registerProvider("custom-backend-llm", {
    name: "Custom Backend LLM",
    baseUrl: LLM_BASE_URL,
    apiKey: LLM_API_KEY,
    api: "openai-completions",
    models: [
      {
        id: LLM_MODEL,
        name: LLM_MODEL,
        reasoning: true,
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 128000,
        maxTokens: 8192
      }
    ]
  });

  // 1. Tool: list_patient_ct_scans
  pi.registerTool({
    name: "list_patient_ct_scans",
    label: "检索患者CT序列列表",
    description: "检索指定患者已上传的所有 CT 检查序列与扫描文件，获取各序列的扫描日期、部位描述、层数及 NIfTI 文件路径，以便选择最合适的序列进行深度分析。",
    promptSnippet: "检索患者的所有 CT 影像序列列表，供 LLM 挑选最匹配的 CT 进行分析",
    parameters: {
      type: "object",
      properties: {
        patient_id: {
          type: "integer",
          description: "患者系统内部 ID (数字)"
        }
      },
      required: ["patient_id"]
    },
    async execute(toolCallId, params) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/agent/internal/patients/${params.patient_id}/ct_scans`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }
        const data = await res.json();
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          details: { count: data.length, patient_id: params.patient_id }
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `获取患者 CT 序列失败: ${err.message}` }],
          isError: true
        };
      }
    }
  });

  // 2. Tool: get_patient_records
  pi.registerTool({
    name: "get_patient_records",
    label: "查询患者病历与检验指标",
    description: "查询患者的基本信息、临床既往史、家族史、主要就诊主诉、现病史及近期实验室检验检查指标。",
    promptSnippet: "查询指定患者的电子病历、既往史及检验指标数据",
    parameters: {
      type: "object",
      properties: {
        patient_id: {
          type: "integer",
          description: "患者系统内部 ID"
        }
      },
      required: ["patient_id"]
    },
    async execute(toolCallId, params) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/agent/internal/patients/${params.patient_id}/records`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }
        const data = await res.json();
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          details: { patient_id: params.patient_id }
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `获取患者病历失败: ${err.message}` }],
          isError: true
        };
      }
    }
  });

  // 3. Tool: get_segmentation_qc
  pi.registerTool({
    name: "get_segmentation_qc",
    label: "查询3D器官分割与质控数据",
    description: "查询患者当前或指定 CT 序列的 3D 器官分割结果，包括双肺、肝脏、脾脏、双肾、大血管等器官的精确体积 (mL)、病灶测量统计及分割任务状态。",
    promptSnippet: "查询 CT 序列的 3D 解剖分割体积、质控指标及病灶统计",
    parameters: {
      type: "object",
      properties: {
        patient_id: {
          type: "integer",
          description: "患者系统内部 ID"
        },
        study_id: {
          type: "string",
          description: "可选的检查序列/研究 ID"
        }
      },
      required: ["patient_id"]
    },
    async execute(toolCallId, params) {
      try {
        const query = params.study_id ? `?study_id=${encodeURIComponent(params.study_id)}` : "";
        const res = await fetch(`${BACKEND_URL}/api/v1/agent/internal/patients/${params.patient_id}/segmentation_qc${query}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }
        const data = await res.json();
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          details: { patient_id: params.patient_id, study_id: params.study_id }
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `获取分割质控数据失败: ${err.message}` }],
          isError: true
        };
      }
    }
  });

  // 4. Tool: draft_radiology_report
  pi.registerTool({
    name: "draft_radiology_report",
    label: "起草放射学结构化报告",
    description: "生成标准化的放射诊断报告结构草稿，包含检查技术、影像所见、诊断印象和临床建议。生成的报告将以结构化卡片呈现给医生，支持一键填入 PACS 诊断报告表单。",
    promptSnippet: "起草放射学结构化报告并返回结构化数据卡片",
    parameters: {
      type: "object",
      properties: {
        patient_id: {
          type: "integer",
          description: "患者 ID"
        },
        study_id: {
          type: "string",
          description: "CT 检查序列 ID"
        },
        exam_technique: {
          type: "string",
          description: "检查方法与技术，例如：胸部薄层平扫 CT（1.25mm 层厚）"
        },
        findings: {
          type: "string",
          description: "影像所见详细描述（包含解剖部位、结节/占位位置、大小、CT值、形态等）"
        },
        impression: {
          type: "string",
          description: "放射学诊断印象（结论），分点列出可能诊断与分类"
        },
        recommendations: {
          type: "string",
          description: "临床随访或进一步检查建议"
        }
      },
      required: ["patient_id", "findings", "impression"]
    },
    async execute(toolCallId, params) {
      const reportDraft = {
        type: "structured_report",
        patient_id: params.patient_id,
        study_id: params.study_id || "default",
        exam_technique: params.exam_technique || "胸部薄层CT平扫",
        findings: params.findings,
        impression: params.impression,
        recommendations: params.recommendations || "建议结合临床定期随访复查。",
        generated_at: new Date().toISOString()
      };

      return {
        content: [
          {
            type: "text",
            text: `[REPORT_CARD_START]${JSON.stringify(reportDraft)}[REPORT_CARD_END]\n\n放射学诊断报告草案已生成完毕，卡片已渲染在对话界面，医生可点击「一键填入诊断报告书」快速填充到 PACS 报告编辑器。`
          }
        ],
        details: reportDraft
      };
    }
  });

  // 5. Special Skill: talk_to_ct (RadSight-8B)
  pi.registerTool({
    name: "talk_to_ct",
    label: "Talk to CT 多模态视觉问答 (RadSight-8B)",
    description: "调用本地部署的 RadSight-8B 多模态放射影像大模型，直接分析 3D CT 容积（.nii.gz 或 DICOM 序列）或 2D 轴位切片，提供高精度临床视觉感知、病灶定位与影像学诊断推理。",
    promptSnippet: "将指定的 CT 体积文件与临床问题提交给本地 RadSight-8B 多模态大模型进行分析",
    parameters: {
      type: "object",
      properties: {
        ct_path: {
          type: "string",
          description: "CT 扫描文件路径（如 /path/to/series.nii.gz 或相对路径）"
        },
        question: {
          type: "string",
          description: "医生提出的影像学临床问题或分析指令"
        },
        series_id: {
          type: "string",
          description: "当前选定的 CT 序列唯一标识符"
        },
        study_id: {
          type: "string",
          description: "所属检查 study_id"
        },
        patient_id: {
          type: "integer",
          description: "患者 ID（用于关联临床病史与上下文）"
        }
      },
      required: ["ct_path", "question"]
    },
    async execute(toolCallId, params) {
      try {
        let patientContext = null;
        if (params.patient_id) {
          try {
            const patRes = await fetch(`${BACKEND_URL}/api/v1/agent/internal/patients/${params.patient_id}/records`);
            if (patRes.ok) {
              const pData = await patRes.json();
              patientContext = {
                patient_id: String(params.patient_id),
                name: pData.patient?.name,
                age: pData.patient?.age,
                gender: pData.patient?.gender,
                symptoms: pData.patient?.symptoms || pData.patient?.history
              };
            }
          } catch (_) {}
        }

        const payload = {
          ct_path: params.ct_path,
          question: params.question,
          study_id: params.study_id,
          patient_context: patientContext
        };

        const res = await fetch(`${RADSIGHT_URL}/v1/vision/talk_to_ct`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(300000)
        });

        if (!res.ok) {
          throw new Error(`RadSight microservice returned HTTP ${res.status}: ${await res.text()}`);
        }

        const data = await res.json();
        return {
          content: [
            {
              type: "text",
              text: data.raw_text || JSON.stringify(data.analysis, null, 2)
            }
          ],
          details: {
            model: data.model || "RadSight-8B",
            stub: Boolean(data.stub),
            quant: data.quant || null,
            device: data.device || null,
            latency_ms: data.latency_ms || null,
            series_info: data.series_info,
            series_id: params.series_id || data.series_info?.filename
          }
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: `RadSight-8B 分析失败: ${err.message}`
            }
          ],
          isError: true
        };
      }
    }
  });

  // 6. Tool: draft_treatment_plan
  pi.registerTool({
    name: "draft_treatment_plan",
    label: "起草完整临床治疗计划",
    description:
      "在已经调用病历、CT 视觉分析与分割质控之后，生成供主治医师复核的完整治疗计划草案。" +
      "必须只使用工具返回的事实（症状、病史、RadSight 原文、器官体积/质控）。禁止编造结节大小、LU-RADS、检验数值或未证实的诊断。" +
      "这是医嘱草案而非自动开立医嘱。",
    promptSnippet: "基于已检索的病历、Talk-to-CT 与分割质控起草完整治疗计划卡片",
    parameters: {
      type: "object",
      properties: {
        patient_id: { type: "integer", description: "患者 ID" },
        study_id: { type: "string", description: "作为依据的 CT 序列 ID" },
        symptom_analysis: {
          type: "string",
          description: "主诉/现病史与影像、分割结果的对照分析，说明哪些症状被影像支持或无法解释"
        },
        working_diagnosis: {
          type: "string",
          description: "工作诊断与危险分层，分点列出，不确定处明确写“待证实”"
        },
        differential: {
          type: "string",
          description: "鉴别诊断及拟排除依据"
        },
        workup: {
          type: "string",
          description: "进一步检查（实验室、肺功能、心电图、痰检、必要时增强CT/支气管镜等）及目的"
        },
        pharmacologic: {
          type: "string",
          description: "药物治疗建议（类别、疗程思路、需医师确认的剂量原则；无把握则写需个体化，不编造具体毫克数）"
        },
        nonpharmacologic: {
          type: "string",
          description: "非药物干预：戒烟、疫苗、肺康复、氧疗评估、过敏原回避等"
        },
        followup: {
          type: "string",
          description: "随访时间表、复查项目与升级指征"
        },
        red_flags: {
          type: "string",
          description: "需紧急就诊或住院的危险信号"
        }
      },
      required: [
        "patient_id",
        "symptom_analysis",
        "working_diagnosis",
        "workup",
        "pharmacologic",
        "followup",
        "red_flags"
      ]
    },
    async execute(toolCallId, params) {
      const planDraft = {
        type: "treatment_plan",
        patient_id: params.patient_id,
        study_id: params.study_id || null,
        symptom_analysis: params.symptom_analysis,
        working_diagnosis: params.working_diagnosis,
        differential: params.differential || "",
        workup: params.workup,
        pharmacologic: params.pharmacologic,
        nonpharmacologic: params.nonpharmacologic || "",
        followup: params.followup,
        red_flags: params.red_flags,
        disclaimer: "本计划由 AI Copilot 根据病历、RadSight-8B 与 VISTA-3D 质控起草，须经接诊医师复核后方可执行，不构成自动医嘱。",
        generated_at: new Date().toISOString()
      };

      return {
        content: [
          {
            type: "text",
            text:
              `[TREATMENT_PLAN_START]${JSON.stringify(planDraft)}[TREATMENT_PLAN_END]\n\n` +
              "完整临床治疗计划草案已生成。卡片已渲染在对话界面，供医师复核后纳入病程与医嘱。"
          }
        ],
        details: planDraft
      };
    }
  });
}
