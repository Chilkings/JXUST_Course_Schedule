//course.js
//获取应用实例
Page({
  data: {
    colorArrays: ["#85B8CF", "#90C652", "#D8AA5A", "#FC9F9D", "#0A9A84", "#61BC69", "#12AEF3", "#E29AAD"],
    array1: ['第一周', '第二周', '第三周',
      '第四周', '第五周', '第六周',
      '第七周', '第八周', '第九周',
      '第十周', '第十一周', '第十二周',
      '第十三周', '第十四周', '第十五周',
      '第十六周', '第十七周', '第十八周',
      '第十九周', '第二十周','第二十一周'
    ],
    zc: 0,   //周次
    wlist: [],

    currDate: null,
    listData: [],
    course_empty: true,
  },

  onPullDownRefresh() {
    this.onShow();
  },



  onShow: function (options) {
    wx.stopPullDownRefresh();
    this.showCourse();
  },


  onLoad: function () {
  },

  showCourse: function () {
    if (!wx.getStorageSync('isLogin')) {
      console.log("未登录获取课表");
      wx.showModal({
        title: '加载失败', content: '请先登录！', showCancel: false, success: function (res) {
          wx.switchTab({
            url: '../../pages/index/index',
            success: function () {
              console.log("called switchtab.");
            }
          });
        }
      });
    } else {
      //已登录
      wx.showToast({ title: '正在加载课表', icon: 'loading', duration: 10000 });
      // this.data.currDate =  new Date().toLocaleDateString().replace(/\//g,'-');   //使用反斜杠转义/
      var date = new Date();       var mon = date.getMonth() + 1;       var day = date.getDate();
      this.data.currDate = date.getFullYear() + "-"+ (mon<10?"0"+mon:mon) + "-"+(day<10?"0"+day:day);
      // console.log(this.data.currDate);
      var userName = wx.getStorageSync('userName');
      var course_cache = userName + this.data.currDate.substr(0,6); //将学号拼接年份作为缓存的key
      // console.log(this.data.currDate);
      this.getZc();

      if (wx.getStorageSync(course_cache)) {
        //缓存中有课表
        console.log("缓存中有课表");
        wx.hideToast();
        this.setData({
          course_empty: false,
          listData: wx.getStorageSync(course_cache),
        });        
        console.log(this.data.listData);
        this.getweekCourse();
      } else {
        // 缓存未找到课表
        var $this = this;
        wx.request({
          url: 'https://jw.webvpn.jxust.edu.cn/app.do',
          header: {
            token: wx.getStorageSync('token'),
          },
          data: {
            'method': 'getKbcxAzc', 
            'xh': wx.getStorageSync('userName'),  
            // 'xnxqid': this.data.firstYear,  //格式为"YYYY-YYYY-X"，非必填，不包含时返回当前日期所在学期课表
            'zc': '1',
          },
          method: 'GET',
          success: function (res) {
            wx.hideToast();
            $this.setData({
              course_empty: false,
              listData: res.data
            });
            wx.setStorageSync(course_cache, res.data) //缓存课表
            console.log("获取课表成功");
            console.log(res.data);
          },
          fail: function () {
            wx.hideToast();
            wx.showModal({ title: '加载失败', content: '请检查网络设置！', showCancel: false });
          },
        })
        this.getweekCourse();
      }
    }
  },


  bindPicker1Change: function (e) {
    this.setData({
      zc : e.detail.value
    });
    this.getweekCourse();
  },

  getweekCourse: function(){

    //首先清空wlist
    this.data.wlist = [];
    console.log("清空了wlist");

    for(var i=0;i<this.data.listData.length;i++)
    {
      var kkzc = this.data.listData[i].kkzc;
      var bg_and_ed_zc;  //开始周次和结束周次
      var flag=0;
      var zc=parseInt(this.data.zc);
      if(kkzc.indexOf('-') != -1 )
      {
        bg_and_ed_zc = kkzc.split('-');
        if( (zc+1) < parseInt(bg_and_ed_zc[0]) || (zc+1) > parseInt(bg_and_ed_zc[1]) ){
        console.log();
        flag=1;   
        }
      }
      else
      {
        bg_and_ed_zc = kkzc.split(',');
        console.log(bg_and_ed_zc);
        if(bg_and_ed_zc.indexOf(String(zc+1)) ==-1){
        flag=1;
        }
      }
      if(flag==1) continue;

      var tempobj = {
        xqj : this.data.listData[i].kcsj[0],
        skjc : this.data.listData[i].kcsj[2],
        skcd : 2,
        kcmc : this.data.listData[i].kcmc+"@"+this.data.listData[i].jsmc,
      };
      this.data.wlist.push(tempobj);
    }
    let wlist = this.data.wlist;
    this.setData({
      wlist
    });
    console.log(this.data.wlist);
    console.log("生成课表数组成功");
  },


  getZc: function(){
    var $this=this;
    wx.request({
      url: 'https://jw.webvpn.jxust.edu.cn/app.do',
      header: {
        token: wx.getStorageSync('token')
      },
      data: {
        'method':'getCurrentTime',
        'currDate': this.data.currDate,
      },
      method: 'GET',
      success: function(res){
        // $this.data.zc = res.data.zc;
        $this.setData({
          zc : res.data.zc-1,
        }),   //储存的周次从0开始
        console.log("获取周次成功");        
        console.log($this.data.zc);
      },
      fail: function(){
        console.log("获取周次失败！！！");
      }
    })
  }

});
