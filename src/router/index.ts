import Vue from "vue";
import VueRouter from "vue-router";
// 登录页面
const Login = () => import('@/views/Login.vue')

/** 可视化 */
const Visualized = () => import('@/views/Main/visualized/Visualized.vue')
// 场站页面
const MainStations = () => import('@/views/Stations/MainStations.vue')
const Overview = () => import('@/views/Stations/overview/Overview2.vue')
const IndustrialTV = () => import('@/views/Stations/IndustrialTV.vue')
const HighConsequenceVideo = () => import('@/views/Stations/HighConsequenceVideo.vue')
const FaceRecognition = () => import('@/views/Stations/FaceRecognition.vue')
const VideoIntercom = () => import('@/views/Stations/videoIntercom/VideoIntercom.vue')
const PerimeterAlarm = () => import('@/views/Stations/perimeteralarm/PerimeterAlarm.vue')
const FireAlarm = () => import('@/views/Stations/firealarm/FireAlarm.vue')
const SecurityStaffPage = () => import('@/views/Stations/securitystaff/SecurityStaffPage.vue')
const LaserMethanePage = () => import('@/views/Stations/lasermethane/LaserMethane.vue')
const SystemMonitor = () => import('@/views/Stations/systemMonitor/SystemMonitor.vue')
const VideoInspection = () => import('@/views/Stations/videoInspection/VideoInspection.vue')



/** 查看所有工业电视 */
const IndustrialTVAll = () => import('@/views/Main/visualized/IndustrialTV.vue')

/** 所有视频轮播 */
const SwiperVideo = () => import('@/views/Main/visualized/swiperVideo.vue')

/** 后台配置页面 */
const ConfigreMain = () => import('@/views/Configration/MainPage.vue')
const User = () => import('@/views/Configration/User.vue')
const Role = () => import('@/views/Configration/Role.vue')
const Permission = () => import('@/views/Configration/Permission.vue')
const Management = () => import('@/views/Configration/Management.vue')
const Station = () => import('@/views/Configration/Station.vue')
const StationLink = () => import('@/views/Configration/StationLink.vue')
const MeasObject = () => import('@/views/Configration/MeasObject.vue')
const Equipment = () => import('@/views/Configration/Equipment.vue')
const Video = () => import('@/views/Configration/Video.vue')
const VideoServer = () => import('@/views/Configration/VideoServer.vue')
const VideoGroup = () => import('@/views/Configration/VideoGroup.vue')
const AlarmType = () => import('@/views/Configration/AlarmType.vue')
const NetNode = () => import('@/views/Configration/NetNode.vue')
const GeoMap = () => import('@/views/Configration/GeoMap.vue')
const Visualization = () => import('@/views/Configration/Visualization.vue')
const Terminal = () => import('@/views/Configration/Terminal2.vue')
const SecurityStaff = () => import('@/views/Configration/SecurityStaff.vue')
const RegularInspection = () => import('@/views/Configration/RegularInspection.vue')
const FireAlarmConfig = () => import('@/views/Configration/FireAlarmConfig.vue')
const LaserMethane = () => import('@/views/Configration/LaserMethane.vue')
const RealInfoConfig = () => import('@/views/Configration/RealInfoConfig.vue')
const VideoLinkages = () => import('@/views/Configration/VideoLinkages.vue')
const Department = () => import('@/views/Configration/Department.vue')

const Test = () => import('@/views/Test.vue')

Vue.use(VueRouter);

// 跳转当前路由时，不显示告警
const VueRouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(to: any) {
    return (VueRouterPush.call(this, to) as any).catch((err: any) => err)
}

const routes = [{
        path: "/login",
        name: "login",
        component: Login
    },
    {
        path: '/',
        redirect: '/main'
    },
    // 可视化路由
    {
        path: '/main',
        name: 'main',
        component: Visualized
    },
    // 保安页面路由
    {
        path: '/security-staff-page',
        name: 'SecurityStaffPage',
        component: SecurityStaffPage
    },
    // 激光甲烷路由
    {
        path: '/laser-methane-page',
        name: 'LaserMethanePage',
        component: LaserMethanePage
    },
    // 场站路由
    {
        path: '/stations',
        name: 'Stations',
        redirect: '/stations/overview',
        component: MainStations,
        children: [{
                path: 'overview',
                name: 'Overview',
                component: Overview
            },
            {
                path: 'industrial-tv',
                name: 'industrialTV',
                component: IndustrialTV
            },
            {
                path: 'high-consequence-video',
                name: 'HighConsequenceVideo',
                component: HighConsequenceVideo
            },
            {
                path: 'face-recognition',
                name: 'FaceRecognition',
                component: FaceRecognition
            },
            {
                path: 'video-intercom',
                name: 'VideoIntercom',
                component: VideoIntercom
            },
            {
                path: 'perimeter-alarm',
                name: 'PerimeterAlarm',
                component: PerimeterAlarm
            },
            {
                path: 'fire-alarm',
                name: 'FireAlarm',
                component: FireAlarm
            },
            {
                path: 'system-monitor',
                name: 'SystemMonitor',
                component: SystemMonitor
            },
            {
                path: 'video-inspection',
                name: 'VideoInspection',
                component: VideoInspection
            }
        ]
    },
    // 后台
    {
        path: "/config",
        name: 'config',
        redirect: '/config/user',
        component: ConfigreMain,
        children: [{
                path: 'user',
                name: 'user',
                component: User,
            },
            {
                path: 'role',
                name: 'role',
                component: Role,
            },
            {
                path: 'permission',
                name: 'permission',
                component: Permission,
            },
            {
                path: 'management',
                name: 'management',
                component: Management,
            },
            {
                path: 'station',
                name: 'station',
                component: Station,
            },
            {
                path: 'stationlink',
                name: 'stationlink',
                component: StationLink,
            },
            {
                path: 'measobject',
                name: 'measobject',
                component: MeasObject,
            },
            {
                path: 'equipment',
                name: 'equipment',
                component: Equipment,
            },
            {
                path: 'video',
                name: 'video',
                component: Video,
            },
            {
                path: 'videoserver',
                name: 'videoserver',
                component: VideoServer,
            },
            {
                path: 'videogroup',
                name: 'videogroup',
                component: VideoGroup,
            },
            {
                path: 'alarmtype',
                name: 'alarmtype',
                component: AlarmType,
            },
            {
                path: 'netnode',
                name: 'netnode',
                component: NetNode,
            },
            {
                path: 'geomap',
                name: 'geomap',
                component: GeoMap,
            },
            {
                path: 'visualization',
                name: 'visualization',
                component: Visualization,
            },
            {
                path: 'terminal',
                name: 'terminal',
                component: Terminal,
            },
            {
                path: 'securitystaff',
                name: 'securitystaff',
                component: SecurityStaff,
            },
            {
                path: 'regularinspection',
                name: 'regularinspection',
                component: RegularInspection,
            },
            {
                path: 'fireAlarmConfig',
                name: 'fireAlarmConfig',
                component: FireAlarmConfig
            },
            {
                path: 'laserMethane',
                name: 'laserMethane',
                component: LaserMethane
            },
            {
                path: 'realInfoConfig',
                name: 'realInfoConfig',
                component: RealInfoConfig
            },
            {
                path: 'videoLinkages',
                name: 'videoLinkages',
                component: VideoLinkages
            },
            {
                path: 'department',
                name: 'department',
                component: Department
            }
        ]
    },
    // 测试
    {
        path: '/test',
        name: 'test',
        component: Test
    },
    // 查看所有工业视频
    {
        path: '/allIndustrialTV',
        name: 'IndustrialTVAll',
        component: IndustrialTVAll
    },
    // 所有视频轮播
    {
        path: '/swiperVideo',
        name: 'SwiperVideo',
        component: SwiperVideo
    }
]

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
})

export default router;