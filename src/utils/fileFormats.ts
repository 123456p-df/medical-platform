export function isNiftiFile(file: Pick<File, 'name' | 'type'>) {
  return /\.nii(?:\.gz)?$/i.test(file.name) || [
    'application/nifti',
    'application/x-nifti',
  ].includes(file.type)
}
