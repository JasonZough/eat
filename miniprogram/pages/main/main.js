const app = getApp()
const db = wx.cloud.database()
const service = require('../../service/index')

Page({
  data: {
      persons: [],
      ordered: false,
      disabeld: true,
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
  toggleOrder () {
    const self = this
    if(this.data.ordered){
        db.collection('persons').where({email: app.globalData.account.email}).get()
        .then((res) => {
            db.collection('persons').doc(res.data[0]._id).update({data: {ordered: false}})
            .then(() => {
                self.setData({
                    persons: self.data.persons.filter((person) => person.email !== app.globalData.account.email),
                    ordered: false
                })
            }, (error) => service.errfy('操作失败', error))
        }, (error) => service.errfy('操作失败', error))
    } else {
        db.collection('persons').where({email: app.globalData.account.email}).get()
        .then((res) => {
            db.collection('persons').doc(res.data[0]._id).update({data: {ordered: true}})
            .then(() => {
                self.setData({
                    persons: self.data.persons.concat([{
                        ...app.globalData.user,
                        ...app.globalData.account,
                        ordered: true
                    }]),
                    ordered: true
                })
                console.log(this.data.persons)
            }, (error) => service.errfy('操作失败', error))
        }, (error) => {
            service.errfy('操作失败', error)
        })
    }
  }  
})