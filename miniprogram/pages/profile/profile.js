const app = getApp()
const db = wx.cloud.database()
const regeneratorRuntime = require('../../lib/regenerator-runtime/runtime.js')
const service = require('../../service/index')

Page({
    data: {
        person: {}
    },
    async onLoad () {
        try {
            let person = app.globalData.profilePerson
            let res = await db.collection('accounts').where({email: person.email}).get()
            person.name = res.data[0].name
            this.setData({person})
        } catch (error) {
            this.setData({person: app.globalData.profilePerson})
            service.errfy('获取员工姓名失败', error)
        }
    }
})