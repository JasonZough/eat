const app = getApp()
const db = wx.cloud.database()
const service = require('../../service/index')
const regeneratorRuntime = require('../../lib/regenerator-runtime/runtime.js')

Page({
  data: {
      persons: [],
      ordered: false,
      disabeld: true,
      working: false
  },
  onLoad () {
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
        if(this.data.persons.find((person) => person.email === app.globalData.account.email)){
            this.setData({
                ordered: true
            })
        }
        this.setData({disabeld: false})
    }, () => service.errfy('获取人员列表失败'))
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
                persons: self.data.persons.filter((person) => person.email !== app.globalData.account.email),
                ordered: false
            })
        } else {
            await db.collection('persons').doc(res.data[0]._id).update({data: {ordered: true}})
            self.setData({
                persons: self.data.persons.concat([{
                    ...app.globalData.user,
                    ...app.globalData.account,
                    ordered: true
                }]),
                ordered: true
            })
        }
    }catch (error) {service.errfy('操作失败', error)}
    this.setData({
        working: false,
        disabeld: false
    })
  }  
})