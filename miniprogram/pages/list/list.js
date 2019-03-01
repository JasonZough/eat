const app = getApp()
const db = wx.cloud.database()

Page({
    data: {
        persons: [],
        initing: false
    },
    async onShow () {
        this.setData({initing: true})
        
    },
})