const app = getApp()
const db = wx.cloud.database()
const service = require('../../service/index')
const regeneratorRuntime = require('../../lib/regenerator-runtime/runtime.js')
const Persons = db.collection('persons')

Page({
    data: {
        inputValue: '',
        disabled: true,
        accounts: [],
        working: false,
        initing: false,
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
    async onShow () {
        this.setData({initing: true})
        const self = this
        wx.getUserInfo({
            async success (data) {
                try{
                    let res = await wx.cloud.callFunction({name: 'getContext'})
                    app.globalData.context = res.result
                    res = await Persons.where({_openid: app.globalData.context.OPENID}).get()
                    if(res.data[0]){
                        app.globalData.user = res.data[0]
                        wx.redirectTo({url: '../main/main'})
                        self.updatePerson(res.data[0], data.userInfo)
                    } else {
                        res = await self.getAccounts()
                        self.setData({accounts: res.result.data || [], initing: false})
                    }
                } catch(error){service.errfy('获取用户信息失败', error)}
            },
            async fail () {
                try{
                    let res = await self.getAccounts()
                    self.setData({accounts: res.result.data || [], initing: false})
                }catch(error){
                    service.errfy('获取账号列表失败', error)
                }
            }
        })
    },
    getAccounts () {
        return wx.cloud.callFunction({
            name: 'getAll',
            data: {
                name: 'accounts'
            }
        })
    },
    updatePerson (present, current) {
        let _id = present._id
        delete present._id
        delete present._openid
        return Persons.doc(present._id).update({
            data: {
                ...present,
                ...current
            }
        })
    },
    async onGotUserInfo (e) {
        if(e.detail.userInfo){
            const user = {...e.detail.userInfo, email: this.data.inputValue}
            try{
                this.setData({working: true, disabled: true})
                let res = await wx.cloud.callFunction({name: 'getContext'})
                app.globalData.context = res.result
                res = await Persons.where({email: this.data.inputValue}).get()
                if(res.data[0]){
                    console.log(res.data[0]._openid, app.globalData.context.OPENID)
                    if(res.data[0]._openid !== app.globalData.context.OPENID){
                        return service.errfy('该邮箱已被占用, 请联系管理员')
                    } else {
                        this.updatePerson(res.data[0], e.detail.userInfo)
                    }
                }
                res = await Persons.where({_openid: app.globalData.context.OPENID}).get()
                if(res.data[0]){
                    await this.updatePerson(res.data[0], user)
                } else {
                    await Persons.add({
                        data: {
                            ...user,
                            ordered: false,
                        }
                    })
                    app.globalData.user = {...user, ordered: false}
                }
                res = await Persons.where({_openid: app.globalData.context.OPENID}).get()
                app.globalData.user = res.data[0]
            } catch(error){
                service.errfy('更新用户失败', error)
            }
            this.setData({working: false, disabled: false})
            wx.redirectTo({url: '../main/main'})
        }
    }
})