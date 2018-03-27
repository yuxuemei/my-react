import React,{ Component } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import Footer from './../components/footer.js';
import Common from './../common.js'
import  './my.css'
class My extends Component {
	constructor(props){
        super(props);
        this.state = {
            menus:[{
               name:'规则',
               img:'http://oslg9bt6h.bkt.clouddn.com/applet/img/my-icon-4.png',
               url:'/rule'
            },/*{
               name:'新手指引',
               img:'http://oslg9bt6h.bkt.clouddn.com/applet/img/my-icon-5.png',
               url:'/pages/my/rule/rule'
            },*/{
               name:'排行榜',
               img:'http://oslg9bt6h.bkt.clouddn.com/applet/img/my-icon-6.png',
               url:'/rank'
            },{
               name:'任务',
               img:'http://oslg9bt6h.bkt.clouddn.com/applet/img/my-icon-4.png',
               url:'/task'
            }],
            honorNumber:[],
            expand:{}, //收益
            expandOld:{}, //收益老接口
            exchangeTicket:false,
            popupName:false   //转到钻石弹框
        }
	}
    componentDidMount(){
        this.getHonorNumber();
        this.getExpand();
        Common.getUserInfo();
    }
    getHonorNumber(){
        Common.get({
            url:'/api/honor/info'
        }).then(respose=>{
            this.setState({
               honorNumber: String(respose.price).split('')
            })
        })
    }
    getExpand(){
        Common.get({
            url:'/api/user/expand'
        }).then(respose=>{
            this.setState({
               expandOld: respose
            })
            this.getExpandNew();
        })
    }
    getExpandNew(){
        Common.get({
            url:'/apivtwo/popularize/profitptotal'
        }).then(respose=>{
            this.setState({
               expand: respose
            })
        })
    }
	render(){
        var user = this.props.data.user;
		return (
			<div className="user">
                <div className="my-top">
                    <Link to="/edit">
                      <div className="my-top-head">
                          <img src={user.head || Common.IMG_DEFAULT} alt="head"></img>
                      </div>
                    </Link>
                    <div className="my-top-right">
                        <div className="dsac" style={{marginLeft: '.13rem'}}>
                            <div className="my-top-name">{user.nickname}</div>
                            <img src={user.sex===1?'http://oslg9bt6h.bkt.clouddn.com/applet/img/my-icon-sexw.png':'http://oslg9bt6h.bkt.clouddn.com/applet/img/my-icon-sexm.png'} alt="sex" className="img-sex"></img>
                        </div>
                        <div className="dsac" style={{marginTop:'.1rem',height: '.4rem'}}>
                            <div className="dsac">
                                <Link to="/record/2">
                                    <img className="my-money-icon" src="http://oslg9bt6h.bkt.clouddn.com/applet/img/my-icon-1.png" alt="my-icon-1"></img>
                                </Link>
                                <Link to="/recharge" >
                                    <div className="my-money-number">
                                        <div className="number-box">
                                            <span>{Common.formatNumber(user.diamonds)}</span>
                                        </div>
                                        <div className="number-right absolute">充</div>
                                    </div>
                                </Link>
                            </div>
                            <div className="dsac" style={{marginLeft: '.3rem'}}>
                                <Link to="/record/4">
                                    <img className="my-money-icon" style={{marginRight: '.08rem'}} src="http://oslg9bt6h.bkt.clouddn.com/applet/img/my-icon-2.png" alt="my-icon-2"></img>
                                </Link>
                                <div className="my-money-number">
                                    <div className="number-box">
                                        <span>{Common.formatNumber(user.ticket)}</span>
                                    </div>
                                    <div className="number-right absolute">兑</div>
                                </div>
                            </div>
                            <div className="dsac" style={{marginLeft: '.3rem'}}>
                                <Link to="/record/3">
                                    <img className="my-money-icon" src="http://oslg9bt6h.bkt.clouddn.com/applet/img/my-icon-3.png" alt="my-icon-3"></img>
                                </Link>
                                <a className="my-money-number" href="user.duiba_url">
                                    <div className="number-box">
                                        <span>{Common.formatNumber(user.crystal)}</span>
                                    </div>
                                    <div className="number-right absolute">换</div>
                                </a>
                            </div>
                        </div>
                    </div>
                    <Link to="/edit">
                        <div className="top-edit absolute">
                            <span className="top-edit-text">编辑资料</span>
                            <img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/icon1_06.png" alt="icon1_06d" style={{width:'.19rem',height:'.19rem',marginLeft: '.05rem'}}></img>
                        </div>
                    </Link>
                </div>
                <div className="big-menu">
                    <div className="top">
                        {
                            this.state.menus.map((menu,index)=>{
                                return (
                                    <Link key={index} to="menu.url">
                                        <div>
                                            <img src={menu.img} className="top-img" alt="top-img"></img>
                                        </div>
                                        <div className="top-text center"><span>{menu.name}</span></div>
                                    </Link>
                                )
                            })
                        }
                    </div>
                    <Link to="/pages/honor/honor/honor" className="item-info more">
                        <div className="bottom relative">
                            <div className="honor-box absolute">
                                {
                                    this.state.honorNumber.map((item,index)=>{
                                        return (
                                            <div key ={index} className="honor-item" v-for="item in honorNumber"><span>{item}</span></div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </Link>
                </div>
                <Link to="/news">
                    <div className="my-block2">
                        <div className="dsac">
                            <img className="block2-img" src="http://oslg9bt6h.bkt.clouddn.com/applet/img/my-icon-8.png" alt="block2-img"></img>
                            <div className="block2-text">我的消息</div>
                        </div>
                        <div className="dsac my-block2-right">
                            <div className="my-block2-right-text">戳我查看</div>
                            <div className="little-dot" v-if="user.count > 0"></div>
                            <img className="my-block2-right-icon" style={{marginLeft: '.1rem'}} alt="arrow-03" src={Common.ARROW_03}></img>
                        </div>
                    </div>
                </Link>
                <div className="my-block3">
                    <Link to="/changepaws" className="my-block3-list relative">
                        <div className="list-icon absolute">
                            <img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/my-icon-10.png" alt="my-icon-10" ></img>
                        </div>
                        <div className="list-block" style={{borderBottom:'1px solid #f5f5f5'}}>
                            <div className="block2-text">修改密码</div>
                            <div className="dsac my-block2-right">
                                <img className="my-block2-right-icon" src={Common.ARROW_03}  alt="my-icon-10"></img>
                            </div>
                        </div>
                    </Link>
                    <Link to="/aboutus" className="my-block3-list relative">
                        <div className="list-icon absolute">
                            <img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/my-icon-11.png"  alt="my-icon-11"></img>
                        </div>
                        <div className="list-block">
                            <div className="block2-text">关于我们</div>
                            <div className="dsac my-block2-right">
                                <img className="my-block2-right-icon" src={Common.ARROW_03} alt="arrow-03"></img>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="my-block4">
                    <div className="my-block3-list relative">
                        <img className="list-icon absolute" src={require('./../images/my-icon-1.png')} alt="my-icon-1"></img>
                        <div className="list-block">
                            <div className="block2-text">我的红包收益</div>
                            <div className="dsac my-block2-right">
                                <div className="make-money center">立即挣红包</div>
                            </div>
                        </div>
                    </div>
                    <div className="my-earnings">
                        <div className="my-earnings-left">
                            <div className="my-earnings-number dsfajc">
                                <div>
                                    <div className="my-earnings-text">收益余额
                                        <span style={{color:'#e2544e'}}>￥{(this.state.expand.balance/100) || 0}</span>
                                    </div>
                                    <div className="my-earnings-text">累计收益
                                        <span>￥{(this.state.expand.amount/100  || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="my-earnings-right">
                            <div className="my-earnings-number dsfajc">
                                <div>
                                    <div className="my-earnings-text">钻石转换比例 <span style={{color:'#6d66c0'}}>{this.state.expandOld.money_to_diamonds}</span></div>
                                    <div className="my-earnings-text2 dsac">
                                        <span style={{fontSize:'.26rem'}}>立即转到钻石</span>
                                        <img src="http://oslg9bt6h.bkt.clouddn.com/applet/img/icon1_arrow.png" className="img-arrow" alt="icon1_arrow"></img>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
		)
	}
}

const mapStateToProps = function(store){
    return {
        data:store.data
    };
};

export default connect(mapStateToProps)(My);