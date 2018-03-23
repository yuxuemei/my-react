import React,{ Component } from 'react'
import { connect } from 'react-redux';
import Common from './../common.js'
import './lineup.css'

// 引入 ECharts 主模块
import echarts from 'echarts/lib/echarts';
// 引入雷达图
import  'echarts/lib/chart/radar';
// 引入标题和图例组件
import  'echarts/lib/component/title'; 
import  'echarts/lib/component/legend';
//鼠标悬浮显示数据
import 'echarts/lib/component/tooltip';

class Lineup extends Component {
	constructor(props){
        super(props);
        let state = this.props.location.state;
        this.state = {
            activityId:state.activityId, //赛事id
            applyId:state.applyId, // 用户提交阵容ID
            status:state.status, //比赛状态
            clubs: [],
            players: [],
            gameId:'', //游戏id 只有匹配赛才会传过来
            clubId: 0, // 当前俱乐部id
            locationId: 0, // 当前位置ID
            locationIndex: 0,
            totalNumber: 0, // 用户战斗力
            teamNum: 0,  // 队员数量
            needMoney: 0,// 所需工资
            allMoney:2000,
            isShowPlayer:false,
            player:{},
            data: [],
            len:0,
            detailType:"chart", //默认打开图标
            seePlayer:'',//选择的队员id
            selectedLen:0,
            initBattle:[], //初始化的阵容队列
            initPower:0, //初始化的战斗力
            initPrice:0,//初始化的工资
            power:'', //战力 1.降序 2.升序
            price:1, //身价 1.降序 2.升序
            type:'',//匹配赛整容提交类型
            searchLineupLen:0, //匹配赛查询出的阵容个数
            sort:1, //1 身价 2 战斗力
            orders:"ASC", //ASC or DESC
            all:"",
            scrollTop:0,
            lineup:{
                battle:[]
            },
            battle:[],
            battleMoney: ''//剩余工资
        }
	}
    //组件加载完成
    componentDidMount(){ 
        let param = this.props.location.state;
        if(param.gameId){
            //匹配赛获取位置处理
            if(param.type ==='add'){
                this.getclub(()=>{
                    this.getPlayerMate();
                });
            }else{
                //获取俱乐部
                this.getApplyData();
            }
        }else{
            this.userlocation(param.applyId);
        }
    }
    userlocation(applyId){
        Common.get({
            url: '/api/activity/userlocation',
            data: {
                applyId: applyId
            },
        }).then(respose=>{
            // 计算总战斗力
            var locationId = '';
            var totalNumber = 0;
            var teamNum = respose.battle.length;
            var selectedLen = 0;
            for (let i = 0; i < teamNum; i++) {
                totalNumber += Number(respose.battle[i].power) || 0;
                if (respose.battle[i].player_id) {
                    selectedLen++;
                }
                if(i === 0){
                    locationId = respose.battle[i].id;
                }
            }
            this.setState({
                lineup : respose,
                battle:respose.battle,
                initBattle : respose.battle,
                initPower : totalNumber.toFixed(2),
                initPrice : respose.battle_money-respose.player_money,
                battleMoney : respose.battle_money-respose.player_money,
                totalNumber : totalNumber.toFixed(2),
                teamNum : teamNum,
                selectedLen : selectedLen,
                locationId : locationId
            })
            if(this.state.gameId){
                this.getPlayerMate();
            }else{
                this.getPlayers();
            }
        });
    }
    tabChange(type){
        this.setState({
            detailType:type
        })
    }
    getPlayers(){
        Common.get({
            url: '/api/players',
            data: {
                activityId: this.state.activityId,
                locationId: this.state.locationId,
                clubId: this.state.clubId,
                power:this.state.power,
                price:this.state.price
            },
        }).then(respose=>{
            if (respose.players) {
                //根据id去掉重复
                respose.players = this.uniqeByKeys(respose.players,['id']);
            }
            this.setState({
                clubs:respose.clubs,
                players:respose.players
            })
        })  
    }
    getPlayerMate(){
        var clubId = this.state.clubId;
        var all = '';
        if(clubId === 0){
            clubId = '';
            all = this.state.all;
        }else{
            all='';
        }
        this.post({
            url: '/apivtwo/vtwo/getshow',
            data: {
                game_id: parseInt(this.state.gameId,10),
                club_id:clubId, //俱乐部id
                player_id:this.state.locationId, //位置id
                type:this.sort,
                orders:this.orders,
                all:all
            },
        }).then(respose=>{
            this.setState({
                players:respose
            })
        })
    }
    //只要俱乐部数据
    getclubData(callback){
        Common.post({
            url: '/apivtwo/vtwo/getclubplayer',
            data: {
                game_id: this.state.gameId,
                c_id:this.state.activityId
            },
        }).then(respose=>{
            var all="";
            var len = respose[0].length;
            for (let i = 0; i < len; i++) {
                if(i===len-1){
                    all+=respose[0][i].id;
                }else{
                    all+=respose[0][i].id+"*";
                }
            } 
            this.setState({
                all:all,
                clubs:respose[0]
            })
            if(callback){
                callback();
            }
        })
    }
    getApplyData(callback){
        var applyId =this.state.applyId;
        if(applyId.indexOf("*")!==-1){
            applyId = applyId.split("*")[0]
        }
        this.get({
            url: '/apivtwo/vtwo/getshowsavelineup',
            data: {
                apply_id: applyId,
            },
        }).then(respose=>{
            var lineup = {};
            var len = respose.length;
            this.setState({
                searchLineupLen:len
            })
            //如果查出来有阵容
            if(len>0){
                var locationId =  respose[0].location_id;
                var selectedLen = 0;
                var totalNumber = 0;
                var priceMoney = 0;
                for (let i = 0; i < len; i++) {
                    totalNumber += Number(respose[i].power) || 0;
                    priceMoney += Number(respose[i].price) || 0;
                    //使用player_id与互动赛一致
                    respose[i].player_id = respose[i].id;
                    respose[i].player_name = respose[i].name;
                    respose[i].name = respose[i].location_name;
                    if(respose[i].id){
                        selectedLen++;
                    }
                }
                lineup.battle = respose;
                lineup.battle_money = this.allMoney;
                lineup.player_money = priceMoney;
                this.setState({
                    lineup : lineup,
                    battle:lineup.battle,
                    initBattle : lineup.battle,
                    initPower : totalNumber.toFixed(2),
                    initPrice : lineup.battle_money-lineup.player_money,
                    battleMoney : lineup.battle_money-lineup.player_money,
                    locationId : locationId,
                    selectedLen : selectedLen,
                    totalNumber : totalNumber.toFixed(2)
                })
                
                this.getclubData(()=>{
                    this.getPlayerMate();
                });
            }else{
                //没有阵容
                this.getclub(()=>{
                    this.getPlayerMate();
                });
            }
        })
    }
    //查询阵容记忆
    getlineup(){
        Common.post({
            url: '/apivtwo/vtwo/getuserlineups',
            data: {
                c_id:parseInt(this.state.activityId,10)
            },
        }).then(respose=>{
            var lineup = this.state.lineup;
            var totalNumber  = 0;
            var money = 0;
            var selectedLen = 0;
            if(respose.length>0){
                respose.map((item,key)=>{
                    item.id = item.location_id;
                    totalNumber+=item.power;
                    money+=item.price;
                    if(item.id){
                        selectedLen++;
                    }
                })
                lineup.battle = respose;
                var locationId = respose[0].location_id;
                this.setState({
                    lineup : lineup,
                    battle:lineup.battle,
                    initBattle : lineup.battle,
                    initPower : 0,
                    initPrice : this.state.allMoney,
                    battleMoney : this.state.allMoney-money,
                    locationId : locationId,
                    selectedLen : selectedLen,
                    totalNumber : totalNumber.toFixed(2)
                })
            }
        })
    }
    //匹配赛获取俱乐部和位置
    getclub(callback){
        Common.post({
            url: '/apivtwo/vtwo/getclubplayer',
            data: {
                game_id: this.state.gameId,
                c_id:this.state.activityId
            },
        }).then(respose=>{
            // 计算总战斗力
            var lineup = {};
            var locationId =  respose[1][0].id;
            var all="";
            var len = respose[0].length;
            for (let i = 0; i < len; i++) {
                if(i===len-1){
                    all+=respose[0][i].id;
                }else{
                    all+=respose[0][i].id+"*";
                }
            } 
            this.all = all;
            lineup.battle = respose[1];
            lineup.battle_money = this.state.allMoney;
            lineup.player_money = 0;
            if(this.searchLineupLen === 0){
                this.setState({
                    clubs:respose[0],
                    lineup : lineup,
                    battle:lineup.battle,
                    initBattle : lineup.battle,
                    initPower : 0,
                    initPrice : this.state.allMoney,
                    battleMoney : lineup.battle_money-lineup.player_money,
                    locationId : locationId
                })
            }else{
                this.setState({
                    clubs:respose[0],
                })
            }
            //查询记忆的阵容
            //console.log("==========================="+this.data.c_id);
            this.getlineup();
            if(callback){
                callback();
            }
        })
    }
    //将对象元素转换成字符串以作比较
    obj2key(obj, keys){
        var n = keys.length,
            key = [];
        while(n--){
            key.push(obj[keys[n]]);
        }
        return key.join('|');
    }
    //去重操作
    uniqeByKeys(array,keys){
        var arr = [];
        var hash = {};
        var len = array.length;
        for (let i = 0, j = len; i < j; i++) {
            var k = this.obj2key(array[i], keys);
            if (!(k in hash)) {
                hash[k] = true;
                arr.push(array[i]);
            }
        }
        return arr;
    }
    selectedClub(id){
        this.setState({
            clubId:id
        },()=>{
            if(this.state.gameId){
                this.getPlayerMate();
            }else{
                this.getPlayers();
            }
        })
    }
    selectedLocation(id,index){
        this.setState({
            locationId:id,
            locationIndex:index
        },()=>{
            if(this.state.gameId){
                this.getPlayerMate();
            }else{
                this.getPlayers();
            }
        })
    }
    sortPlayer(sort,orders){  
        if(this.state.gameId){
            this.setState({
                sort:sort,
                orders:orders
            },()=>{
                this.getPlayerMate();
            }) 
        }else{
            this.setState({
                power:sort,
                price:orders
            },()=>{
                this.getPlayers();
            }) 
        }
    }
    // 查看选手详情
    seePlayerDetail(index,id) {
        this.setState({
            isShowPlayer:true,
            seePlayer:id,
            player:this.state.players[index]
        },()=>{
           this.getPlayerDetail();
        })
    }
    // 智能推荐
    recommendLineup() {
        var lineup = this.state.lineup;
        var activityId =this.state.activityId.toString();
        var applyId =this.state.applyId.toString();
        if(activityId.indexOf("*")!==-1){
            activityId = activityId.split("*")[0]
        }
        if(applyId.indexOf("*")!==-1){
            applyId = applyId.split("*")[0]
        }
        Common.get({
            url: '/api/activity/auto',
            data: {
                activityId:activityId,
                applyId: applyId
            },
        }).then(respose=>{
            Common.success("推荐成功！");
            // 计算总战斗力
            var totalNumber = 0;
            var battle = respose.battle;
            var teamNum = battle.length;
            for (let i = 0; i < teamNum; i++) {
                totalNumber += Number(battle[i].power) || 0;
            }
            lineup.battle = battle;
            lineup.battle_money = respose.battle_money;
            lineup.player_money = respose.player_money;
            this.setState({
                lineup:lineup,
                battle:lineup.battle,
                battleMoney:lineup.battle_money-lineup.player_money,
                totalNumber:totalNumber.toFixed(2),
                selectedLen:teamNum
            })
        });
    }
    //清除阵容
    clearLineup(){
        var battle = this.state.battle;
        battle.map(function(item,key){
            item.player_id = undefined;
            item.player_name = undefined;
            item.head = undefined;
            item.price = undefined;
        })
        this.setState({
            battle:battle,
            battleMoney:this.state.allMoney,
            totalNumber:0,
            selectedLen:0
        })
    }
    //提交阵容
    submitLineup(){
        if(this.state.type){
            if(this.state.searchLineupLen === 0){
                this.saveLineupMate(1);
            }else{
                this.saveLineupMate(2);
            }
        }else{
            this.saveLineupTrue();
        }
    }
    // 提交阵容--互动赛
    saveLineupTrue() {
        var battle = this.state.battle;
        var data = [];
        var battleLen = battle.length;
        var playerIds = [];
        for (let i = 0; i < battleLen; i++) {
            data.push({
                player: battle[i].player_id,
                location: battle[i].location_id
            });
            playerIds.push(battle[i].player_id);
        }
        var isRepeat = this.isRepeat(playerIds);
        if(isRepeat){
            this.confirm("老板，一个队员只能打一个位置！");
        }else{
            Common.post({
                type: 'POST',
                url: '/api/apply/battle',
                data: {
                    applyId: this.state.applyId,
                    data: JSON.stringify(data)
                },
            }).then(respose=>{
                this.confirm("阵容配置成功！");
                setTimeout(() => {
                    this.props.history.goBack();
                },500);
            })
        }
    }
    saveLineupMate(type){
        var battle = this.state.battle;
        var lineup = this.state.lineup;
        var data = [];
        var battleLen = battle.length;
        for (let i = 0; i < battleLen; i++) {
            data.push({
                player_id: battle[i].player_id,
                location_id:battle[i].location_id
            });
        }
        if(this.state.battleMoney){
            if(this.state.battleMoney<0){
                this.confirm("工资上限最多2000万！");
            }else{
                this.submitFun(type,data);
            }
        }else{
            if(lineup.battle_money-lineup.player_money>=0){
                this.submitFun(type,data);
            }else{
                this.confirm("工资上限最多2000万！");
            }
        }
    }
    submitFun(type,data){
        var players = [];
        data.map(function (item, key) {
            players.push(item.player_id);
        })
        var param = {
                apply_id: this.state.applyId,
                player_location:JSON.stringify(data),
                type:type //阵容保存类型
            };
        if(type===1){
            param.pools_id = this.state.pools_id;
            param.c_id = this.state.activityId;
        }
        var isRepeat = this.isRepeat(players);
        if(isRepeat){
            this.confirm("老板，一个队员只能打一个位置！");
        }else{
            Common.post({
                url: '/apivtwo/vtwo/savelineup',
                data: param,
            }).then(respose=>{
                this.$router.push("/match?currentTab=1")
            })
        }
    }
    isRepeat(arr) {
        var hash = {}; 
        for(let i in arr) { 
            if(hash[arr[i]]){
                return true; 
            } 
            hash[arr[i]] = true; 
        } 
        return false;
    }
    /*-------------------------------------玩家详情弹框---------------------------------------*/
    closePlayerBox(bool){
        this.setState({
            isShowPlayer:false
        })
        //如果选择队员后需要重新查询
        if(bool){
            if(this.state.gameId){
                this.getPlayerMate();
            }else{
                this.getPlayers();
            }
        }
    }
    //对象数组比较
    compare(prop) {
        return function (obj1, obj2) {
            var val1 = obj1[prop];
            var val2 = obj2[prop];
            if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
                val1 = Number(val1);
                val2 = Number(val2);
            }
            if (val1 < val2) {
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }            
        }
    }
    getPlayerDetail(){
        Common.get({
            url: '/api/players/data',
            data:{
                playerId: this.state.seePlayer,
            },
          }).then(respose=>{
                var item = respose.data;
                if(item){
                    var length = item.length;
                    this.setState({
                       data:item,
                       len:length 
                    })
                    var array = [];
                    var array2 = [];
                    var categories = [];
                    //var totalScroe = 0;
                    for (let i = 0; i < length; i++) {
                      //设置了最大值根据最大值排序 否则根据title排序
                      if(item[i].data_info[0].max_intergral){
                          item[i].data_info = item[i].data_info.sort(this.compare("max_intergral"));
                      }else{
                          item[i].data_info = item[i].data_info.sort(this.compare("title"));
                      }

                      //totalScroe += Number((item[i].avg_pts)); 
                      var data_info_length = item[i].data_info.length;
                      for (let j = 0; j < data_info_length; j++) {
                          if(i===0){
                              array[j] = 0;
                          }

                          array[j] += Number(item[i].data_info[j].value);
                          array2[j] = item[0].data_info[j].value;
                          //近期表现
                          //将最后的数据算平均值并保留1位小数
                          if(i === length-1){
                            var obj = {};
                              array[j] = (array[j]/length).toFixed(1);
                              //标题只获取一次
                              obj.name = item[i].data_info[j].title;
                              if(item[i].data_info[j].max_intergral){
                                obj.max = item[i].data_info[j].max_intergral;
                              }
                              categories.push(obj);
                          }
                      }
                    }
                    //有数据才渲染雷达图
                    if(array.length>0){
                        var chart = echarts.init(document.getElementById("radar"));
                        chart.setOption({
                          tooltip: { 
                            textStyle:{
                              fontSize:12
                            }
                          },
                          shape: 'circle',
                          color:['rgba(144,147,183,1)','rgba(217,93,52,1)'],//透明度问题 'rgba(243,69,39,1)',
                          legend: {
                              show:true,
                              left:"auto",
                              orient:'vertical',
                              data: ['均场表现','近期表现'], //'近期表现',
                              textStyle:{
                                color:['#d95d34','#9093b7'],
                                backgroundColor :"#f0e4ca", // 图例文字颜色
                              }
                          },
                          radar: {
                              nameGap:5, //指示器与名称的距离
                              splitNumber :4,//分割段数
                              indicator: categories,
                              radius:70
                          },
                          toolbox: {
                              show : true,
                              feature : {
                                  mark : {show: true},
                                  dataView : {show: true, readOnly: false},
                                  restore : {show: true},
                                  saveAsImage : {show: true}
                              }
                          },
                          calculable : true,
                          series: [{
                              name: '预算 vs 开销（Budget vs spending）',
                              type: 'radar',
                              itemStyle: {//图形样式，可设置图表内图形的默认样式和强调样式（悬浮时样式）：
                                      normal: {
                                          areaStyle: {
                                              type: 'default'
                                          }
                                      }
                                  },
                              data : [
                                  {
                                      value : array,
                                      name : '场均'
                                  },
                                   {
                                      value : array2,
                                      name : '近期'
                                  }
                              ]
                          }]
                      })
                    }
                }
          });
    }
    //选中选手
    selectedPlayer() {
        var id = this.state.seePlayer;
        var players = this.state.players;
        //位置id
        var locationId = this.state.locationId;
        //位置id索引
        var locationIndex = this.state.locationIndex;
        var lineup = this.state.lineup;
        var playerLen = players.length;
        var obj = lineup.battle[locationIndex];
        for (let i = 0; i < playerLen; i++) {
            if (players[i].id === id) {
                players[i].act = true;
                    obj.head = players[i].head;
                    obj.power = players[i].power;
                    obj.player_name = players[i].name;
                    obj.player_id = players[i].id;
                    obj.location_id = locationId;
                    obj.price = players[i].price;
            } else {
                players[i].act = false;
            }
        }
        
        var battleMoney = lineup.battle_money;
        var totalNumber = 0;
        var battle = this.state.battle;
        var teamNum = battle.length;
        var selectedLen = 0;
        var battleLen = battle.length;
        for (let _i = 0; _i < battleLen; _i++) {
            totalNumber += Number(battle[_i].power) || 0;
            if (battle[_i].player_id) {
                selectedLen++
                battleMoney -= battle[_i].price;
            }
        }
        this.setState({
            players : players,
            battle : battle,
            totalNumber : totalNumber.toFixed(2),
            selectedLen : selectedLen,
            battleMoney : battleMoney
        })
        this.closePlayerBox(true);

        if(locationIndex === (teamNum-1)){
            locationIndex=0,
            locationId=battle[0].id
            if(battle[0].player_id){
                locationId=battle[0].location_id;
            }else{
                locationId=battle[0].id;
            }
        }else{
            locationIndex=parseInt(locationIndex+1,10);
            if(battle[locationIndex].player_id){
                locationId=battle[locationIndex].location_id;
            }else{
                locationId=battle[locationIndex].id;
            }
        }
        this.setState({
            locationIndex:locationIndex,
            locationId:locationId
        },()=>{
            if(this.state.gameId){
                this.getPlayerMate();
            }else{
                this.getPlayers();
            }
        })
    }
    /*-------------------------------------玩家详情弹框---------------------------------------*/
    renderLeft(){
        var battle = this.state.battle;
        if(this.state.type==='edit' && this.state.searchLineupLen>0){
            // 匹配赛位置 修改
            return(
                <div className="location-tab">
                {
                    battle.map((item,index)=>{
                        return(
                            <div key={index} className={`item ${item.location_id === this.state.locationId?'act':''}`} onClick={this.selectedLocation.bind(this,item.location_id,index)}>
                                <div style={{color:'#B4251D',fontSize:'.18rem',marginBottom:'.1rem'}}>￥{battle[index].price || 0}万</div>
                                <div className="img-head">
                                    <img src={battle[index].head?battle[index].head:'http://oslg9bt6h.bkt.clouddn.com/normal.png'} className="img-head" alt="img-head"></img>
                                </div>
                                <div className="name moreDot1">{battle[index].player_name}</div>
                                <div className="battle">
                                    ({item.name}
                                    <span>{battle[index].player_id?'1/1':'0/1'})</span>
                                </div>
                            </div>
                        )
                    })
                }
                </div>
            );
        }else if(this.state.searchLineupLen===0 || this.state.type==='add' || !this.state.type){
            //互动赛位置 匹配赛位置新增
            return(
                <div className="location-tab">
                {
                    battle.map((item,index)=>{
                        return(
                            <div key={index} className={`item ${item.id === this.state.locationId?'act':''}`} onClick={this.selectedLocation.bind(this,item.id,index)} >
                                <div style={{color:'#B4251D',fontsize:'.18rem',marginBottom:'.06rem'}}>￥{battle[index].price || 0}万</div>
                                <div className="img-head">
                                    <img src={battle[index].head?(battle[index].head || Common.IMG_DEFAULT):'http://oslg9bt6h.bkt.clouddn.com/normal.png'} className="img-head" alt="img-head"></img>
                                </div>
                                <div className="player_name moreDot1">{battle[index].player_name}</div>
                                <div className="battle">
                                    ({item.name}
                                    <span>{battle[index].player_id?'1/1':'0/1'})</span>
                                </div>
                            </div>
                        )
                    })
                }
                </div>
            );
        }
    }
    renderSort(){
        if(!this.state.gameId){
            let priceSortMatch,powerSortMatch;
            let power = this.state.power;
            let price = this.state.price;
            if(power){
                priceSortMatch = (
                    <div onClick={this.sortPlayer.bind(this,'',2)}>
                       身价
                       <img src={require('./../images/sort-disabled.png')} className="sort-img" alt="sort-disabled"></img>
                    </div>
                );
            }else if(!power && price === 1){
                priceSortMatch = (
                    <div onClick={this.sortPlayer.bind(this,'',2)}>
                       身价
                       <img src={require('./../images/sort-desc.png')} className="sort-img" alt="sort-desc" style={{width:'.13rem'}}></img>
                    </div>
                );
            }else if(!power && price === 2){
                priceSortMatch = (
                    <div onClick={this.sortPlayer.bind(this,'',1)}>
                       身价
                       <img src={require('./../images/sort-asc.png')} className="sort-img" alt="sort-asc" style={{width:'.13rem'}}></img>
                    </div>
                );
            }

            if(price){
                powerSortMatch = (
                    <div onClick={this.sortPlayer.bind(this,2,'')}>
                       战力
                       <img src={require('./../images/sort-disabled.png')} className="sort-img" alt="sort-disabled"></img>
                    </div>
                );
            }else if(!price && power === 1){
                powerSortMatch = (
                    <div onClick={this.sortPlayer.bind(this,2,'')}>
                       战力
                       <img src={require('./../images/sort-desc.png')} className="sort-img" alt="sort-desc" style={{width:'.13rem'}}></img>
                    </div>
                );
            }else if(!price && power === 2){
                powerSortMatch = (
                    <div onClick={this.sortPlayer.bind(this,1,'')}>
                       战力
                       <img src={require('./../images/sort-asc.png')} className="sort-img" alt="sort-asc" style={{width:'.13rem'}}></img>
                    </div>
                );
            }
            return(
                <div className="sort">
                    {priceSortMatch}
                    {powerSortMatch}
                </div>
            );
        }else{
            let priceSortMate,powerSortMate;
            let sort = this.state.sort;
            let orders = this.state.orders;
            if(sort === 2){
                priceSortMate = (
                    <div onClick={this.sortPlayer.bind(this,1,'ASC')}>
                       身价
                       <img src={require('./../images/sort-disabled.png')} className="sort-img" alt="sort-disabled"></img>
                    </div>
                );
            }else if(orders === 'DESC' && sort === 1){
                priceSortMate = (
                    <div onClick={this.sortPlayer.bind(this,1,'ASC')}>
                       身价
                       <img src={require('./../images/sort-desc.png')} className="sort-img" alt="sort-desc"></img>
                    </div>
                );
            }else if(orders === 'ASC' && sort === 1){
                priceSortMate = (
                    <div onClick={this.sortPlayer.bind(this,1,'DESC')}>
                       身价
                       <img src={require('./../images/sort-asc.png')} className="sort-img" alt="sort-asc"></img>
                    </div>
                );
            }

            if(orders === 1){
                powerSortMate = (
                    <div onClick={this.sortPlayer.bind(this,2,'ASC')}>
                       战力
                       <img src={require('./../images/sort-disabled.png')} className="sort-img" alt="sort-disabled"></img>
                    </div>
                );
            }else if(orders === 'DESC' && sort === 2){
                powerSortMate = (
                    <div onClick={this.sortPlayer.bind(this,2,'ASC')}>
                       战力
                       <img src={require('./../images/sort-desc.png')} className="sort-img" alt="sort-desc"></img>
                    </div>
                );
            }else if(orders === 'ASC' && sort === 2){
                powerSortMate = (
                    <div onClick={this.sortPlayer.bind(this,2,'DESC')}>
                       战力
                       <img src={require('./../images/sort-asc.png')} className="sort-img" alt="sort-asc"></img>
                    </div>
                );
            }
            return(
                <div className="sort">
                    {priceSortMate}
                    {powerSortMate}
                </div>
            );
        }
    }
    renderSelectImg(id){
        if(this.state.battle[this.state.locationIndex].player_id === id){
            return(
                <img className="select-img absolute" src={require('./../images/selected.png')} alt="selected"></img>
            );
        }
    }
    renderTableHead(item,index){
        if(index === 0){
            return(
                <div className="popup-list">
                    <div className="popup-list-top">比赛</div>
                    <div className="popup-list-top">参赛场次</div>
                    <div className="popup-list-top">场均战力</div>
                    {
                        item.data_info.map((title,idx)=>{
                            return(
                                <div className="popup-list-top" key={idx}>{title.title}</div>
                            )
                        })
                    }
                </div> 
            );
        }
    }
    renderPlayer(){
        if(this.state.isShowPlayer){
            let player = this.state.player;
            return (
                <div className="popup z-fixed">
                    <div className="player-detail">
                        <img className="player-close" src={require('./../images/player-close.png')}  onClick={this.closePlayerBox.bind(this,false)} alt="player-close" />
                        <div style={{backgroundColor:'rgb(244,244,244)',marginTop: '-.3rem'}}>
                            <div className="match-my-lineup">
                                <div className="item relative">
                                  <img className="select-head absolute" src={player.head || Common.IMG_DEFAULT} alt="select-head" />
                                  <img className="select-tag" src={require('./../images/person-detail.png')} alt="select-tag" />
                                  <span className="power absolute">{player.power || 0}</span>
                                  <span className="userinfo absolute">{player.name}</span>
                                </div>
                                <div className="info">
                                    <div>
                                        <span className="player_name">{player.name}</span>
                                        <span className="money">(￥{player.price || 0}万)</span>
                                    </div>
                                    <div className="info-data">
                                        <div style={{marginRight:'.1rem'}}>
                                            <img className="icon-player" src={require('./../images/team.png')} alt="team" />
                                            战队 {!this.state.gameId?player.team_name:player.club_name}
                                        </div>
                                        <div className="intercept">
                                            <img className="icon-player" src={require('./../images/power.png')} alt="power" />
                                            战力 {player.power || 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="detail_bar">
                              <div className={this.state.detailType === 'chart'?'act':''} onClick={this.tabChange.bind(this,'chart')}>生涯</div>
                              <div className={this.state.detailType === 'list'?'act':''}  onClick={this.tabChange.bind(this,'list')}>近期</div>
                        </div>
                        <div className="chart" style={this.state.detailType==='chart'?{}:{display:'none'}}>
                            <div className="container">
                                <div id="radar" className="canvas"></div>
                            </div>
                        </div>
                        <div className="list-data" style={this.state.detailType==='list'?{height:'100%',width:'100%',overflow: 'auto'}:{display:'none'}}>
                            {
                                this.state.data.map((item,index)=>{
                                    return(
                                        <div key={index}>
                                            {this.renderTableHead(item,index)}
                                            <div style={{paddingLeft:'.12rem'}}>
                                                <div className="popup-list-content">
                                                    <div className="popup-list-content-block">{item.wars}</div>
                                                    <div className="popup-list-content-block">{item.player_count}</div>
                                                    <div className="popup-list-content-block" style={{color:'rgb(144,146,184)'}} >{item.avg_pts}</div>
                                                    {
                                                        item.data_info.map((title,idx)=>{
                                                            return(
                                                                <div className="popup-list-content-block" key={idx}>{title.value}</div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            <div className="container center" style={this.state.len<=0?{paddingTop:'.86rem'}:{display:'none'}}>
                                该队员暂无比赛数据
                            </div>
                        </div>
                        <div className="bottom-btn">
                            <div className="select-btn center" onClick={this.selectedPlayer.bind(this)}>确定选择</div>
                        </div>
                    </div>
                </div> 
            );
        }
    }
	render(){
        let operaButton;
        let submitButton;
        let selectedLen = this.state.selectedLen;
        let battleLen = this.state.battle.length;
        if(selectedLen === battleLen){
            submitButton = (<div className="select" onClick={this.submitLineup.bind(this)}>提交{selectedLen || 0}/{battleLen || 0}</div>);
        }else{
            submitButton = (<div className="select-normal">提交{selectedLen || 0}/{battleLen || 0}</div>);
        }
        if(this.state.status !==2 ){
            operaButton = (
                <div style={{display:'flex'}}>
                    <div><div className="clear" onClick={this.clearLineup.bind(this)}>清空阵容</div></div>
                    <div><div className="recommend" onClick={this.recommendLineup.bind(this)}>智能推荐</div></div>
                    <div>{submitButton}</div>
                </div>
            );
        }
		return (
			<div className="interaction">
                <div className="player-tab text-left"> 
                    <div className={`item ${this.state.clubId === 0?'act':''}`}>全部</div>
                    {
                        this.state.clubs.map((item,index)=>{
                            return(
                                <div key={index} className={`item ${this.state.clubId === item.id?'act':''}`}>{item.name}</div>
                            )
                        })
                    }
                </div>
                <div className="lineuplist relative" >
                    {this.renderLeft()}
                    <div style={{marginTop:'.77rem',height:'12rem'}}>
                        {this.renderSort()}
                        <div className="player-list">
                            {
                                this.state.players.map((item,index)=>{
                                    return(
                                        <div key={index} onClick={this.seePlayerDetail.bind(this,index,item.id)}>
                                            <div className={`item relative {(item.act || battle[locationIndex].player_id === item.id)?'act':''}`}>
                                                <img className="lineup-player-head" src={item.head} alt="head"></img>
                                                <span className="price absolute">￥{item.price}万</span>
                                                <span className="power absolute intercept">战力:{item.power.toFixed(2)}</span>
                                                {this.renderSelectImg(item.id)}
                                            </div>
                                            <div className="center" style={{width:'1.4rem',margin:'-.45rem auto 0 auto'}}> 
                                                <div className="player_name">{item.name}</div>
                                                <div className="team">({!this.state.gameId?item.team_name:item.club_name})</div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="bottom-area">
                    <div style={{width:'3rem'}}>
                        <div className="lineup-info-bottom">阵容总战力：{this.state.totalNumber}</div>
                        <div className="lineup-info-bottom">可用工资：
                            <span style={{color:'#da5c34'}}>￥{this.state.battleMoney !== undefined?this.state.battleMoney:((this.state.lineup.battle_money - this.state.lineup.player_money) || 0)}万</span>
                        </div>
                    </div>
                    {operaButton}
                </div>
                {this.renderPlayer()}
            </div>
		)
	}
}

const mapStateToProps = function (store){
    return {
	    data: store.data
	};
};
export default connect(mapStateToProps)(Lineup);