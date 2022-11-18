/**
 * Model AnalyticsExportTypes
 *
 */
export type AnalyticsExportTypes = {
  id: number
  typeId: number | null
  name: string
}

/**
 * Model AnalyticsExports
 *
 */
export type AnalyticsExports = {
  id: number
  appId: number
  typeId: number
  year: number
  month: number
  filename: string
  ext: string
  meta: JsonValue | null
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

/**
 * Model AnalyticsMausValues
 *
 */
export type AnalyticsMausValues = {
  id: number
  appId: number
  regionId: number
  year: number
  counterName: string
  indexInYear: number
  countryId: number
  localeId: number
  platformId: number
  counts: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model AppAuthServices
 *
 */
export type AppAuthServices = {
  id: number
  appId: number
  authServiceId: number
  ordinal: number
  createdBy: number | null
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model AppPlatforms
 *
 */
export type AppPlatforms = {
  id: number
  appId: number
  platformId: number
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model AppReceiptValidators
 *
 */
export type AppReceiptValidators = {
  id: number
  receiptTypeId: number
  appId: number
  meta: JsonValue
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model AppUsers
 *
 */
export type AppUsers = {
  id: number
  userId: number
  appId: number
  createdAt: Date
  updatedAt: Date | null
  hidden: boolean
}

/**
 * Model AppVersions
 *
 */
export type AppVersions = {
  id: number
  appPlatformId: number
  name: string
  description: string | null
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model Apps
 *
 */
export type Apps = {
  id: number
  uid: string
  name: string
  hash: string
  contentBucket: string
  archiveBucket: string
  roleArn: string
  cfIdPub: string
  cfIdSec: string | null
  configuration: JsonValue | null
  setupVersion: string
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model AssetResourceVersionRequirements
 *
 */
export type AssetResourceVersionRequirements = {
  id: number
  assetResourceId: number
  appPlatformId: number
  exclude: boolean
  minVersionId: number | null
  maxVersionId: number | null
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model AssetResources
 *
 */
export type AssetResources = {
  id: number
  assetId: number
  resourceId: number | null
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model Assets
 *
 */
export type Assets = {
  id: number
  appId: number
  name: string
  ordinal: number
  isActive: boolean
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model AuthServiceTypes
 *
 */
export type AuthServiceTypes = {
  id: number
  typeId: number
  name: string
  settingsStructure: JsonValue | null
}

/**
 * Model AuthServices
 *
 */
export type AuthServices = {
  id: number
  name: string
  typeId: number
  settings: JsonValue | null
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model CalendarFeedData
 *
 */
export type CalendarFeedData = {
  id: number
  dataHash: string | null
  userId: number
  appId: number
  typeId: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

/**
 * Model CalendarFeedDataTypes
 *
 */
export type CalendarFeedDataTypes = {
  id: number
  typeId: number | null
  name: string
}

/**
 * Model Categories
 *
 */
export type Categories = {
  id: number
  appId: number
  name: string
  isDraft: boolean
  isLocked: boolean
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model ContentTypes
 *
 */
export type ContentTypes = {
  id: number
  typeId: number
  name: string
}

/**
 * Model Countries
 *
 */
export type Countries = {
  id: number
  name: string
  shortcode: string
}

/**
 * Model Deployments
 *
 */
export type Deployments = {
  id: number
  ulid: string | null
  appId: number
  content: JsonValue | null
  meta: JsonValue | null
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

/**
 * Model EpisodeContent
 *
 */
export type EpisodeContent = {
  id: number
  episodeLocalizedId: number
  resourceId: number
  contentTypeId: number
  appPlatformId: number | null
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model EpisodeLocalized
 *
 */
export type EpisodeLocalized = {
  id: number
  episodeId: number
  localeId: number
  name: string | null
  data1: string | null
  data2: string | null
  data3: string | null
  data4: string | null
  data5: string | null
  views: number
  createdBy: number
  updatedBy: number | null
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model EpisodeLocalizedViews
 *
 */
export type EpisodeLocalizedViews = {
  id: number
  regionId: number
  episodeLocalizedId: number
  episodeId: number
  weekStart: Date
  day: Date
  views: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model EpisodeTags
 *
 */
export type EpisodeTags = {
  id: number
  tagId: number
  episodeId: number
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model EpisodeVersionRequirements
 *
 */
export type EpisodeVersionRequirements = {
  id: number
  episodeId: number
  appPlatformId: number
  exclude: boolean
  minVersionId: number | null
  maxVersionId: number | null
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model Episodes
 *
 */
export type Episodes = {
  id: number
  appId: number
  name: string
  resourceTypeId: number
  views: number
  playerTypeId: number
  defaultThumbnailId: number | null
  createdBy: number
  updatedBy: number | null
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model FileLogs
 *
 */
export type FileLogs = {
  id: number
  fileId: number
  statusId: number
  meta: JsonValue | null
  createdAt: Date
}

/**
 * Model FileStatus
 *
 */
export type FileStatus = {
  id: number
  statusId: number | null
  name: string | null
}

/**
 * Model Files
 *
 */
export type Files = {
  id: number
  parentId: number | null
  resourceId: number
  name: string | null
  meta: JsonValue | null
  type: string | null
  ext: string | null
  originalName: string | null
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model JobLogs
 *
 */
export type JobLogs = {
  id: number
  jobId: number
  statusId: number
  meta: JsonValue | null
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model JobServices
 *
 */
export type JobServices = {
  id: number
  serviceId: number | null
  name: string
}

/**
 * Model JobStatus
 *
 */
export type JobStatus = {
  id: number
  statusId: number | null
  name: string
}

/**
 * Model Jobs
 *
 */
export type Jobs = {
  id: number
  serviceId: number
  externalId: string | null
  inputId: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model Locales
 *
 */
export type Locales = {
  id: number
  name: string
  shortcode: string
}

/**
 * Model Platforms
 *
 */
export type Platforms = {
  id: number
  name: string
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model PlayerTypes
 *
 */
export type PlayerTypes = {
  id: number
  typeId: number
  name: string
}

/**
 * Model ReceiptTypes
 *
 */
export type ReceiptTypes = {
  id: number
  typeId: number
  name: string
  metaTemplate: JsonValue
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model RegionCountries
 *
 */
export type RegionCountries = {
  id: number
  regionId: number
  countryId: number
  isDraft: boolean
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model RegionLocales
 *
 */
export type RegionLocales = {
  id: number
  regionId: number
  localeId: number
  isDraft: boolean
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model Regions
 *
 */
export type Regions = {
  id: number
  appId: number
  name: string
  isDraft: boolean
  releaseTimezoneId: number
  defaultLocaleId: number | null
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model ReleaseCategories
 *
 */
export type ReleaseCategories = {
  id: number
  categoryId: number
  releaseId: number
  ordinal: number | null
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model Releases
 *
 */
export type Releases = {
  id: number
  regionId: number
  episodeId: number
  sortIndex: number
  isDraft: boolean
  isDemoContent: boolean
  publishDate: Date | null
  unpublishDate: Date | null
  createdBy: number
  updatedBy: number | null
  createdAt: Date
  updatedAt: Date | null
  deletedAt: Date | null
}

/**
 * Model ResourceTypes
 *
 */
export type ResourceTypes = {
  id: number
  typeId: number
  name: string
}

/**
 * Model Resources
 *
 */
export type Resources = {
  id: number
  appId: number
  typeId: number
  isPrivate: boolean
  meta: JsonValue | null
  createdBy: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model Rights
 *
 */
export type Rights = {
  id: number
  rightId: number
  name: string
}

/**
 * Model RoleRights
 *
 */
export type RoleRights = {
  id: number
  roleId: number
  rightId: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model RoleTypes
 *
 */
export type RoleTypes = {
  id: number
  typeId: number | null
  name: string | null
}

/**
 * Model Roles
 *
 */
export type Roles = {
  id: number
  name: string
  roleTypeId: number
  appId: number | null
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model SequelizeMeta
 *
 */
export type SequelizeMeta = {
  name: string
}

/**
 * Model Tags
 *
 */
export type Tags = {
  id: number
  appId: number
  name: string | null
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model Timezones
 *
 */
export type Timezones = {
  id: number
  name: string
}

/**
 * Model TokenTypes
 *
 */
export type TokenTypes = {
  id: number
  typeId: number | null
  name: string | null
}

/**
 * Model Tokens
 *
 */
export type Tokens = {
  id: number
  userId: number
  typeId: number
  hash: string | null
  origin: string | null
  meta: JsonValue | null
  expiresAt: Date
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model UserRoles
 *
 */
export type UserRoles = {
  id: number
  userId: number
  roleId: number
  createdAt: Date
  updatedAt: Date | null
}

/**
 * Model Users
 *
 */
export type Users = {
  id: number
  email: string | null
  password: string
  firstname: string | null
  lastname: string | null
  localeId: number
  twofaSecret: string | null
  deletedAt: Date | null
  confirmedAt: Date | null
  createdAt: Date
  updatedAt: Date | null
}
