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

//显示隐藏门票兑换框
export function exchange(exchange){
	return {
        type:types.EXCHANGE,
        exchange
	}
}

//显示隐藏下注，追加框
export function bet(bet){
	return {
        type:types.BET,
        bet
	}
}