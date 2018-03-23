import React,{ Component } from 'react'
import { connect } from 'react-redux';

class Countdowm extends Component {
    constructor(props){
          super(props);
          this.state = {
              content: '倒计时中...'
          }
    }
    //组件加载完成
    componentDidMount(){ 
      this.countdowm(this.props.endTime)
    }

    countdowm(timestamp){
      let self = this.props;
      let timer = setInterval(()=>{
          let nowTime = new Date();
          let endTime = new Date(timestamp * 1000);
          let t = endTime.getTime() - nowTime.getTime();
          if(t>0){
              let day = Math.floor(t/86400000);
              let hour=Math.floor((t/3600000)%24);
              let min=Math.floor((t/60000)%60);
              let sec=Math.floor((t/1000)%60);
              var dayFormat = day < 10 ? "<span>0</span><span>" + day+"</span>" : "<span>"+day.toString().charAt(0)+"</span><span>"+day.toString().charAt(1)+"</span>";
              hour = hour < 10 ? "0" + hour : hour;
              var hourFormat = hour < 10 ? "<span>0</span><span>" + hour.toString().charAt(1)+"</span>" : "<span>"+hour.toString().charAt(0)+"</span><span>"+hour.toString().charAt(1)+"</span>";
              min = min < 10 ? "<span>0</span><span>" + min + "</span>" : "<span>"+min.toString().charAt(0)+"</span><span>"+min.toString().charAt(1)+"</span>";
              if(self.format === 'true'){
                 sec = sec < 10 ? "<span style='margin-left:5px;'>0</span><span>" + sec + "</span>" : "<span>"+sec.toString().charAt(0)+"</span><span>"+sec.toString().charAt(1)+"</span>";
              }else if(self.format === 'false'){
                  sec = sec < 10 ? "<span>0</span><span>" + sec + "</span>" : "<span>"+sec.toString().charAt(0)+"</span><span>"+sec.toString().charAt(1)+"</span>";
              }
              let format = '';
              if(day > 0){
                 if(self.format === 'true'){
                    format =  `${dayFormat}<span class="timer-text">天</span>${hourFormat}<span class="timer-text">时</span>${min}<span class="timer-text">分</span>${sec}<span class="timer-text">秒</span>`;
                 }else if(self.format === 'false'){
                    format =  `${dayFormat}<span class="timer-text"> 天 </span>${hourFormat}<span class="timer-text"> <span>:</span> </span>${min}<span class="timer-text"> <span>:</span> </span>${sec}<span class="timer-text"></span>`;
                 }
              }
              if(day <= 0 && hour > 0 ){
                  if(self.format === 'true'){
                    format = `${hourFormat}<span class="timer-text">时</span>${min}<span class="timer-text">分</span>${sec}<span class="timer-text">秒</span>`;
                  }else if(self.format === 'false'){
                    format = `${hourFormat}<span class="timer-text"> <span>:</span> </span>${min}<span class="timer-text"> <span>:</span> </span>${sec}<span class="timer-text"></span>`;
                  }
              }
              if(day <= 0 && hour <= 0){
                 if(self.format === 'true'){
                    format =`${min}分${sec}<span class="timer-text">秒</span>`;
                  }else if(self.format === 'false'){
                    format =`${min} <span>:</span> ${sec}<span class="timer-text"></span>`;
                  }
              }
              this.setState({
                 content:format
              })
          }else{
              clearInterval(timer);
              this.setState({
                 content:self.endText
              })
          }
      },1000);
    }
    render(){
      //将HTML字符串解析为html样式显示
      return (
        <div className="c-pei" dangerouslySetInnerHTML={{__html: this.state.content}}></div>
      )
    }
}

const mapStateToProps = function (store){
    return {
      data: store.data
  };
};
export default connect(mapStateToProps)(Countdowm);