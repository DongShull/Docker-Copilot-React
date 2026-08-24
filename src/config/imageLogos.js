// 内置常用镜像logo配置
// 格式: { "镜像名称": "logo 文件路径" }
// 支持镜像名称匹配，如 "nginx" 会匹配 "nginx:latest", "nginx:alpine" 等

// 导入图片资源
import MediaSaberLogo from '../assets/logos/media-saber.png';
import MoviepilotLogo from '../assets/logos/moviepilot.png';
import DockerCopilotLogo from '../assets/logos/docker-copilot.png';
import MTPhotos from '../assets/logos/mt-photos.png';
import ITToolsLogo from '../assets/logos/it-tools.webp';
import SubStoreLogo from '../assets/logos/sub-store.webp';
import JellyfinLogo from '../assets/logos/jellyfin.png';
import RedisLogo from '../assets/logos/redis.png';
import PostgresLogo from '../assets/logos/postgres.png';
import SunPanelLogo from '../assets/logos/sun-panel.png';
import QinglongLogo from '../assets/logos/qinglong.svg';
import TransmissionLogo from '../assets/logos/transmission.png';
import QBittorrentLogo from '../assets/logos/qbittorrent.webp';
import FnDeskLogo from '../assets/logos/fndesk.png';
import FNTVLogo from '../assets/logos/fntv.png';
import CookiecloudLogo from '../assets/logos/cookiecloud.png';
import CodeServerLogo from '../assets/logos/code-server.png';
import IYUULogo from '../assets/logos/iyuu.png';
import LuckyLogo from '../assets/logos/lucky.png';
import EmbyserverLogo from '../assets/logos/embyserver.png';
import AudiobookshelfLogo from '../assets/logos/audiobookshelf.png';
import MySQLLogo from '../assets/logos/mysql.png';
import OneApiLogo from '../assets/logos/one-api.png';
import QDLogo from '../assets/logos/qd.png';
import OneHubogo from '../assets/logos/one-hub.png';
import ByteMuseLogo from '../assets/logos/byte-muse.jpg';
import NextChatLogo from '../assets/logos/next-chat.png';
import MdcNgLogo from '../assets/logos/mdc-ng.png';
import RichDogLogo from '../assets/logos/rich-dog.svg';
import MsTmdbLogo from '../assets/logos/ms_tmdb.png';
import iconCatalog from './iconCatalog.generated.json';
import { normalizeImageRepository, resolveImageIcon } from '../utils/iconResolver.js';

export const builtInImageLogos = {
  "xylplm/media-saber": MediaSaberLogo,
  "xylplm/bm-simulate-xunlei-api-to-media-saber": MediaSaberLogo,
  "jxxghp/moviepilot-v2": MoviepilotLogo,
  "0nlylty/dockercopilot": DockerCopilotLogo,
  "mtphotos/mt-photos": MTPhotos,
  "kqstone/mt-photos-insightface-unofficial": MTPhotos,
  "mtphotos/mt-photos-ai": MTPhotos,
  "corentinth/it-tools": ITToolsLogo,
  "xream/sub-store": SubStoreLogo,
  "nyanmisaka/jellyfin": JellyfinLogo,
  "redis": RedisLogo,
  "postgres": PostgresLogo,
  "hslr/sun-panel": SunPanelLogo,
  "whyour/qinglong": QinglongLogo,
  "linuxserver/transmission": TransmissionLogo,
  "linuxserver/qbittorrent": QBittorrentLogo,
  "imgzcq/fndesk": FnDeskLogo,
  "qiaokes/fntv-record-view": FNTVLogo,
  "easychen/cookiecloud": CookiecloudLogo,
  "codercom/code-server": CodeServerLogo,
  "iyuucn/iyuuplus": IYUULogo,
  "iyuucn/iyuuplus-dev-nodb": IYUULogo,
  "gdy666/lucky": LuckyLogo,
  "amilys/embyserver": EmbyserverLogo,
  "audiobookshelf": AudiobookshelfLogo,
  "mysql": MySQLLogo,
  "qdtoday/qd": QDLogo,
  "songquanpeng/one-api": OneApiLogo,
  "martialbe/one-api": OneHubogo,
  "envyafish/byte-muse":ByteMuseLogo,
  "yidadaa/chatgpt-next-web":NextChatLogo,
  "mdcng/mdc":MdcNgLogo,
  "zhaoyangguang/rebatedog":RichDogLogo,
  "gatecross/ms_tmdb":MsTmdbLogo,
  "ms_tmdb":MsTmdbLogo,
};

export const resolveImageLogo = (imageName, customLogos = {}, hints = []) => {
  return resolveImageIcon({
    imageName,
    customLogos,
    builtInLogos: builtInImageLogos,
    catalogAliases: iconCatalog.aliases,
    catalogRevision: iconCatalog.revision,
    hints,
  });
};

export const iconCatalogInfo = {
  revision: iconCatalog.revision,
  source: iconCatalog.source,
  license: iconCatalog.license,
  icons: iconCatalog.icons,
};

export const getCatalogIconURL = (slug) =>
  `https://raw.githubusercontent.com/homarr-labs/dashboard-icons/${iconCatalog.revision}/png/${encodeURIComponent(slug)}.png`;

// Backwards-compatible URL helper. New UI code should use resolveImageLogo so
// generated fallbacks retain their label, color, source and confidence.
export const getImageLogo = (imageName, customLogos = {}, hints = []) => {
  return resolveImageLogo(imageName, customLogos, hints).url;
};

// 获取所有支持的镜像名称列表
export const getSupportedImageNames = () => {
  return Object.keys(builtInImageLogos);
};

// 检查镜像是否有内置logo
export const hasBuiltInLogo = (imageName) => {
  const repository = normalizeImageRepository(imageName);
  return Object.keys(builtInImageLogos).some(key => normalizeImageRepository(key) === repository);
};
