Page({

  /*一、当前班级的管理*/
  // ‘班级名’响应
  classManage: function() {
    this.setData({
      currentClassSettingHiddent: false
    })
  },
  // 弹窗确认响应 
  currentClassSettingConfirm: function() {
    this.setData({
      currentClassSettingHiddent: true
    })
  },
  /* 1、添加班级 */
  // 点击添加按钮响应
  addClass: function () {
    this.setData({
      hiddenInputClassMessages: false
    })
  },
  // 输入班级名响应
  inputClassName: function (e) {
    console.log(e.detail.value)
    this.inputTempClassName = e.detail.value
  },
  // 输入学生总数响应
  inputStudentNumber: function (e) {
    this.inputTempStudentNumber = e.detail.value
  },
  // 信息填写确认响应
  inputClassMessagesConfirm: function () {
    var name = this.inputTempClassName
    var num = this.inputTempStudentNumber
    var obj = { className: name, studentNumber: '(' + num + '人)' } //把班级名和人数做成一个对象
    // 判断输入是否合法
    // 判断输入名字是否已经存在
    var nameAlreadExist = false
    for (var i = 0; i < this.data.classList.length; i++) {
      if (name == this.data.classList[i].className) {
        nameAlreadExist = true
      }
    }
    if (!name) { // 班级名不能为空
      wx.showModal({
        content: '还没填写名字呢！',
      })
    } else if (nameAlreadExist) { // 班级名不能重复
      wx.showModal({
        content: '该班级已经存在',
      })
    } else if (!num) { // 人数不能为空
      wx.showModal({
        content: '还没填写人数呢！',
      })
    } else if (num < 1) { // 人数不能为0或者负数
      wx.showModal({
        content: '不可能只有0人吧？',
      })
    } else if (num > 300) { // 人数不能超过300
      wx.showModal({
        content: '技术有限，目前一个班最多只支持300人,带来不便还请谅解！',
      })
    } else {
      this.data.classList.push(obj) // 用数组的push()函数将obj添加到对象数组中
      var update = this.data.classList // 复制一份数组，以便后面的画面渲染赋值使用

      for (let i = 0; i < num; i++) { // 为新添加的班级初始化学生相关信息
        var student = {id: i+1, absentCount: 0, beLatedCount: 0, score: 60, remark: ''}
        this.data.studentList[i] = student
      }
      // 画面渲染赋值
      this.setData({
        classList: update
      })
      // 更新本地数据
      wx.setStorage({ // 全部班级数组
        key: 'classMessage',
        data: this.data.classList
      })
      wx.setStorage({ // 新添班级的全部学生信息
        key: name,
        data: this.data.studentList,
      })
      // 隐藏弹窗
      this.setData({
        hiddenInputClassMessages: true
      })
      // 消息提示框显示
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 2000
      })
    }

  },
  // 信息填写取消响应
  inputClassMessagesCancel: function () {
    this.setData({
      hiddenInputClassMessages: true
    })
  },
  /* 2、删除班级 */
  rmClass: function (event) {
    var clickName = event.currentTarget.dataset.classname
    console.log(clickName)
    var index
    var that = this
    // 1. 先找出点击了哪一个班级
    for (var i = 0; i < this.data.classList.length; i++) {
      if (clickName == this.data.classList[i].className) {
        index = i
      }
    }  
    
    // 2. 弹窗确认
    wx.showModal({
      title: '确定删除该班级？',
      content: '这将是一个不可逆操作，该班级的学生信息将一并全部删除！',
      confirmColor: 'red',
      cancelColor: 'green',
      success (res) { 
        if (res.confirm) {
          // 2.1 重置当前班级的显示
          if (that.data.classList.length == 1) { // 2.1.1 列表只有一个班级时，删除班级后，当前班级设置为'请选择班级'
            that.setData({
              currentClassName: '请选择班级'
            })
          } else if (clickName + that.data.classList[index].studentNumber == that.data.currentClassName && index != 0) { // 2.1.2 另外，若删除班级不是0下标班级且删除班级为当前班级时，删除班级后，当前班级设置者为0下标的班级
            console.log(that.data.currentClassName)
            that.setData({
              currentClassName: that.data.classList[0].className + that.data.classList[0].studentNumber
            })
          } else if (clickName + that.data.classList[index].studentNumber == that.data.currentClassName && index == 0) { // 2.1.3 另外，若删除班级是0下标且为当前班级时，删除班级后，当前班级设置者为1下标的班级
            that.setData({
              currentClassName: that.data.classList[1].className + that.data.classList[1].studentNumber
            })
          } // 2.1.4 另外，若删除班级不是当前班级，则当前班级不变
          // 2.1.5 更新本地数据中的currentClassName
          wx.setStorage({
            key: 'currentClassName',
            data: that.data.currentClassName,
          })

          // 2.2 更新本地数据中的classMessage，同时更新班级列表渲染
          var update = that.data.classList // 2.2.1 复制原数组
          update.splice(index, 1) // 2.2.2 splice方法删除副本数组中下标为index的一项
          that.setData({ 
            classList: update // 2.2.3 更新渲染数据，让旧数组等于它的副本
          }) 
          wx.setStorage({ // 2.2.4 更新本地数据
            key: 'classMessage',
            data: that.data.classList,
          })

          // 2.3 Toast消息提示框提示删除成功
          wx.showToast({ // 2. 
            title: '删除成功',
          })
        } else if (res.cancel) {}
      }
    })

  },
  /* 3、选择班级*/
  classSelect: function (event) {
    var that = this
    var name
    var clickName = event.currentTarget.dataset.classname
    // 由event的内容找出是点击了哪一个
    for (var i = 0; i < this.data.classList.length; i++) {
      if (clickName == this.data.classList[i].className) {
        name = that.data.classList[i].className + that.data.classList[i].studentNumber
        this.setData({
          currentClassName: name,
          currentClassSettingHiddent: true
        })
        wx.showToast({
          title: '选择成功',
          icon: 'success',
          duration: 2000
        })
        wx.setStorage({
          key: 'currentClassName',
          data: name,
        })
        // 上面setData和setStorage各自内部的数据不共享
        return
      }
    }
  },



  /*二、主动回答的实现*/
  // 弹窗取消响应
  cancel: function () {
    this.setData({
      hiddenmodalput: true
    });
  },
  // 弹窗确认响应 
  confirm: function () {
    try {
      // 获取当前班级名
      var currentClassName = wx.getStorageSync('currentClassName')
      if (currentClassName) {
        // 获取名字中的人数信息
        var startIndex = currentClassName.lastIndexOf('(') + 1
        var endIndex = currentClassName.lastIndexOf('人')
        var num = parseInt(currentClassName.slice(startIndex, endIndex))
      } 
    } catch (e) { }
    // 参数合法性判断
    if (!this.inputNumber) {
      wx.showModal({
        title: '错误',
        content: '请输入学生号码',
        showCancel: false
      })
    } else if (this.inputNumber < 0 || this.inputNumber > num) {
      wx.showModal({
        title: '错误',
        content: '没有' + this.inputNumber + '号学生，请重新输入',
        showCancel: false
      })
      this.setData({
        hiddenmodalput: true
      })
    }
    else {
      wx.navigateTo({
        url: '/src/pages/answer/answer?studentNumber=' + this.inputNumber
      })
      this.setData({
        hiddenmodalput: true
      })
    }
  },
  // input输入响应
  bindKeyInput: function(e) {
    this.inputNumber = e.detail.value //注意这里不能用this.setData
  },
  // ‘主动回答’响应
  answer: function (e) {
    try {
      // 获取当前班级名
      var currentClassName = wx.getStorageSync('currentClassName')
      if (currentClassName == '请选择班级') {
        wx.showModal({
          content: '请先选择当前班级',
        })
      } else {
          this.setData({
            hiddenmodalput: false,
          })
        }
    } catch (e) { }
  },


  /*三、随机抽查的实现*/
  check: function (e) {
    try {
      // 获取当前班级名
      var currentClassName = wx.getStorageSync('currentClassName') 
      if (currentClassName != '请选择班级') {
        // 获取名字中的人数信息
        var startIndex = currentClassName.lastIndexOf('(') + 1
        var endIndex = currentClassName.lastIndexOf('人')
        var num = parseInt(currentClassName.slice(startIndex, endIndex))
        // 生成随机数
        var randomDigit = Math.floor(Math.random() * num) + 1
        // 页面跳转
        wx.navigateTo({
          url: '/src/pages/check/check?randomDigit=' + randomDigit
        })
      } else {
        wx.showModal({
          content: '请先选择当前班级',
        })
      }
    } catch (e) {}
  },

  /*四、学生记录的实现*/
  record: function (e) {
    wx.navigateTo({
      url: '/src/pages/record/record'
    })
  },

  /**
   * 页面的初始数据
   */
  data: {
    currentClassSettingHiddent: true, // 班级管理弹窗隐藏控制变量
    currentClassName: '请选择班级', // 默认情况下的当前班级

    hiddenInputClassMessages: true, // 输入班级信息弹窗控制
    inputTempClassName: '', // 输入班级名暂时量
    inputTempStudentNumber: 0, // 输入班级总人数暂时量

    hiddenmodalput: true, // 输入号码弹窗隐藏控制变量
    erroHiddenmodalput: true, // 输入号码错误弹窗隐藏控制变量

    inputNumber: '00',

    classList: [], // 存放各班级信息
    studentList: [], // 存放当前班级的学生信息

    menu: [
      {
        name: '学生记录',
        iconImageSrc: '/images/record.png',
        cf: 'record'
      },
      {
        name: '主动回答',
        iconImageSrc: '/images/answer.png',
        cf: 'answer'
      },
      {
        name: '随机抽问',
        iconImageSrc: '/images/check.png',
        cf: 'check'
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    //每一次加载画面时，将获取数据缓存区的数据进行画面渲染
    try {
      var value1 = wx.getStorageSync('classMessage')
      if (value1) {
        this.setData({
          classList: value1,  
        })
      }
    } catch (e) {}
    try {
      var value2 = wx.getStorageSync('currentClassName')
      if (value2) {
        console.log(value2)
        this.setData({
          currentClassName: value2,
        })
      } else {
        this.setData({
          currentClassName: '请选择班级',
        })
      }
    } catch (e) {}
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})