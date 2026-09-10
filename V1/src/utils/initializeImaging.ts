import * as cornerstone from '@cornerstonejs/core'
import * as cornerstoneTools from '@cornerstonejs/tools'
import dicomImageLoader from '@cornerstonejs/dicom-image-loader'

let initialization: Promise<void> | undefined
export function initializeImaging() {
  initialization ??= (async () => {
    await cornerstone.init()
    // Local Part 10 files use the dataset-backed provider so pixel frames remain available.
    dicomImageLoader.init({ useLegacyMetadataProvider: true, maxWebWorkers: 2 })
    await cornerstoneTools.init()
    cornerstoneTools.addTool(cornerstoneTools.WindowLevelTool)
    cornerstoneTools.addTool(cornerstoneTools.PanTool)
    cornerstoneTools.addTool(cornerstoneTools.ZoomTool)
    cornerstoneTools.addTool(cornerstoneTools.StackScrollTool)
  })().catch((error) => { initialization = undefined; throw error })
  return initialization
}
