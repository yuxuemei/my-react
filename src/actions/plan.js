import * as types from './action-type.js'
//添加计划
export function addPlan(item){
	return {
        type:types.ADD,
        item
	}
}
//添删除计划
export function deletePlan(id){
	return {
        type:types.DELETE,
        id
	}
}
//显示隐藏计划
export function show(show){
	return {
        type:types.SHOW,
        show
	}
}
//获取USER
export function user(user){
	return {
        type:types.USER,
        user
	}
}

//显示隐藏loading
export function loading(loading){
	return {
        type:types.LOADING,
        loading
	}
}