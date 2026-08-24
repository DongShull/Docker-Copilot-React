export function getImageRepository(imageName = '') {
  const digestIndex = imageName.indexOf('@')
  if (digestIndex >= 0) return imageName.slice(0, digestIndex)

  const lastSlash = imageName.lastIndexOf('/')
  const lastColon = imageName.lastIndexOf(':')
  return lastColon > lastSlash ? imageName.slice(0, lastColon) : imageName
}
