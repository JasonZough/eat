const db = wx.cloud.database()

module.exports = {
    errfy (message, error) {
        if(error) console.error(error)
        wx.showModal({
            title: message
        })
    }
}