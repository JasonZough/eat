const app = getApp()
const db = wx.cloud.database()
const service = require('../../service/index')

Page({
    data: {
        inputValue: '',
        disabled: true,
        accounts: []
    },
    setInputValue (e) {
        this.setData({
            inputValue: e.detail.value.trim()
        })
        if(this.data.accounts.find((account) => account.email === this.data.inputValue)){
            this.setData({disabled: false})
        } else {
            this.setData({disabled: true})
        }
    },
    onLoad () {
        let account
        try{account = JSON.parse(wx.getStorageSync('account'))
        } catch(error){console.log(error)}
        if(account){
            wx.redirectTo({url: '../main/main'})
            wx.getUserInfo({
                success (res) {
                    app.globalData.user = res.userInfo
                    app.globalData.account = account
                },
                fail () {
                    wx.redirectTo({url: '../index/index'})
                }
            })
        } else {
            this.getAccounts()
        }
    },
    getAccounts () {
        wx.cloud.callFunction({
            name: 'getAll',
            data: {
                name: 'accounts'
            }
        }).then((data) => {
            this.setData({
                accounts: data.result.data
            })
        }, (error) =>{
            console.error(error)
            service.errfy('获取账号信息失败')
        })
    },
    onGotUserInfo (e) {
        if(e.detail.userInfo){
            app.globalData.user = e.detail.userInfo
            app.globalData.account.email = this.data.inputValue
            wx.navigateTo({url: '../main/main'})
            const account = this.data.accounts.find((a) => a.email === this.data.inputValue)
            wx.setStorageSync('account', JSON.stringify(account))
            db.collection('persons').add({
                data: {
                    ...e.detail.userInfo,
                    ...account,
                    ordered: false
                }
            })
        }
    }
})