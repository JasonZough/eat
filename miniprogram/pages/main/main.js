const app = getApp()
const db = wx.cloud.database()
const service = require('../../service/index')
const regeneratorRuntime = require('../../lib/regenerator-runtime/runtime.js')

Page({
  data: {
      persons: [],
      ordered: false,
      disabeld: true,
      working: false,
      forbid: false,
  },
  onLoad () {
    wx.cloud.callFunction({name: 'getTime'})
    .then((res) => {
        let serverTime = new Date(res.result)
        if(serverTime.getHours() >= 17){
            this.setData({forbid: true})
        }
    })
    this.setData({ordered: app.globalData.user.ordered})
    wx.cloud.callFunction({
        name: 'getAll',
        data: {
            name: 'persons'
        }
    })
    .then((res) => {
        this.setData({
            persons: (res.result.data || []).filter((person) => person.ordered)
        })
        this.setData({disabeld: false})
    }, () => service.errfy('获取人员列表失败'))
  },
  showProfile (e) {
    let person = e.currentTarget.dataset.person 
    app.globalData.profilePerson = person
    wx.navigateTo({url: '../profile/profile'})
  },
  async toggleOrder () {
    const self = this
    this.setData({
        working: true,
        disabeld: true,
    })
    try {
        let res = await db.collection('persons').where({email: app.globalData.account.email}).get()
        if(this.data.ordered){
            await db.collection('persons').doc(res.data[0]._id).update({data: {ordered: false}})
            self.setData({
                persons: self.data.persons.filter((person) => person._openid !== app.globalData.context.OPENID),
                ordered: false
            })
            app.globalData.user.ordered = false
        } else {
            await db.collection('persons').doc(res.data[0]._id).update({data: {ordered: true}})
            self.setData({
                persons: self.data.persons.concat([{
                    ...app.globalData.user,
                    ordered: true,
                    _openid: app.globalData.context.OPENID,
                }]),
                ordered: true
            })
            app.globalData.user.ordered = true
        }
    }catch (error) {service.errfy('操作失败', error)}
    this.setData({
        working: false,
        disabeld: false
    })
  }  
})