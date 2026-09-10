# 肺结节模型接入接口

当前网站已经具备肺部 CT 肺结节候选检测的完整业务接口。模型推理作为独立 GPU 服务运行，网站后端只发送当前影像文件，不发送患者姓名、证件号或病历文本。

## 1. 配置模型服务

复制 `backend/.env.example` 为 `backend/.env`，填写：

```dotenv
LUNG_NODULE_MODEL_URL=http://127.0.0.1:8001
LUNG_NODULE_MODEL_TOKEN=replace-with-a-private-service-token
LUNG_NODULE_MODEL_NAME=MONAI/lung_nodule_ct_detection:0.6.9
LUNG_NODULE_MODEL_TIMEOUT_SECONDS=300
LUNG_NODULE_MAX_FINDINGS=300
```

`LUNG_NODULE_MODEL_URL` 指向实际运行 MONAI Bundle 的机器。模型在另一台 GPU 服务器上时，把 `127.0.0.1` 换成内网地址；若通过 Docker Compose 运行，则填写该服务在 Compose 网络中的服务名。

应用数据库需要先升级：

```sh
cd backend
uv run alembic upgrade head
```

## 2. 模型服务必须实现的协议

网站后端会请求：

```http
POST /v1/lung-nodule/detect
Authorization: Bearer <LUNG_NODULE_MODEL_TOKEN>
Content-Type: multipart/form-data
```

表单字段：

- `file`：`.nii` 或 `.nii.gz` 肺部 CT。
- `score_threshold`：`0` 到 `1` 的候选阈值，默认 `0.1`。

模型服务返回 JSON：

```json
{
  "model_name": "MONAI/lung_nodule_ct_detection:0.6.9",
  "coordinate_system": "RAS",
  "box_mode": "cccwhd",
  "findings": [
    {
      "box": [12.4, -98.1, 42.7, 8.0, 7.2, 9.1],
      "score": 0.91,
      "label": 0,
      "side": "right",
      "lobe": "upper_lobe"
    }
  ]
}
```

约束：

- `box` 是 `[center_x, center_y, center_z, width, height, depth]`，单位为毫米。
- 坐标必须是 RAS 世界坐标，`box_mode` 固定为 `cccwhd`。
- `side` 和 `lobe` 可省略；网站会保存原始世界坐标并换算为影像 voxel 坐标。
- 模型服务只返回候选，不直接写患者数据库，也不生成 3D 模型。
- 非 2xx、格式错误、无效坐标或超大响应会把任务标记为失败；模型内部错误不会返回给浏览器。

如果模型和 API 必须在同一 Python 进程运行，也可以配置 `LUNG_NODULE_CALLABLE=module:function`。函数签名为：

```python
def infer(*, image_path, score_threshold, progress):
    progress(50)
    return {
        "model_name": "your-model:version",
        "coordinate_system": "RAS",
        "box_mode": "cccwhd",
        "findings": [],
    }
```

## 3. 网站侧接口

所有接口都需要登录；创建和审核任务仅允许有患者写权限的医生操作。

```text
GET    /api/v1/analysis/status
POST   /api/v1/medical-images/{image_id}/analysis
GET    /api/v1/analysis/tasks/{task_id}
GET    /api/v1/medical-images/{image_id}/findings
GET    /api/v1/patients/{patient_id}/findings
PATCH  /api/v1/findings/{finding_id}
```

创建任务：

```json
{
  "analysis_type": "lung_nodule_detection",
  "score_threshold": 0.1
}
```

医生审核 finding：

```json
{
  "status": "confirmed"
}
```

可用状态为 `pending`、`confirmed`、`modified`、`dismissed`。修改 `label` 或 `description` 时会自动进入 `modified`。

## 4. 前端运行模式

双击 `start.command` 是合成数据预览，不会把假数据发送到模型。联调真实模型时需要同时启动数据库和后端，并用以下方式启动前端：

```sh
VITE_LOCAL_PREVIEW=false pnpm start
```

进入患者的“Imaging”页，选择 `CT · Lung` 影像后点击“开始肺结节检测”。任务完成后，可在“AI 辅助诊断”页审核结果。

## 5. 当前范围

本阶段只接肺部 CT 肺结节候选检测。器官分割和既有 3D Viewer 保持独立，未加入新的 3D 处理。模型输出属于计算机辅助检测结果，需要结合原始 CT 和临床资料由医生复核。
