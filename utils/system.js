//微信小程序胶囊
const SYSTEM_INFO = uni.getSystemInfoSync();

//获取状态栏高度（屏幕顶部显示时间、信号的区域）
export const getStatusBarHeight = ()=> SYSTEM_INFO.statusBarHeight || 15;

//计算标题栏高度
export const getTitleBarHeight = ()=>{
	if(uni.getMenuButtonBoundingClientRect){
		let {top,height} = uni.getMenuButtonBoundingClientRect();
		return height + (top - getStatusBarHeight())*2		
	}else{
		return 40;
	}
}

//计算整个导航栏总高度（状态栏高度 + 标题栏高度）
export const  getNavBarHeight = ()=> getStatusBarHeight()+getTitleBarHeight();

//针对头条小程序（MP-TOUTIAO）获取左侧图标的位置，其他平台默认返回 0
export const getLeftIconLeft = ()=> {
	// #ifdef MP-TOUTIAO
		let {leftIcon:{left,width}}  = tt.getCustomButtonBoundingClientRect();
		return left+ parseInt(width);
	// #endif
	
	// #ifndef MP-TOUTIAO
		return 0
	// #endif	
}