class WxgamePlatform {
    name = 'wxgame'
    login() {
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res) => {
                    resolve(res)
                }
            })
        })
    }
    getUserInfo() {
        return new Promise((resolve, reject) => {
            wx.getUserInfo({
                withCredentials: true,
                success: function (res) {
                    var userInfo = res.userInfo
                    var nickName = userInfo.nickName
                    var avatarUrl = userInfo.avatarUrl
                    var gender = userInfo.gender //性别 0：未知、1：男、2：女
                    var province = userInfo.province
                    var city = userInfo.city
                    var country = userInfo.country
                    resolve(userInfo);
                }
            })
        })
    }
    share() {
        return new Promise((resolve, reject) => {
            wx.showShareMenu({
                withShareTicket: true
            });
            wx.onShareAppMessage(function () {
                return {
                    title: "testShare",
                    imageUrl: 'resource/assets/Images/finger.png',
                    success: (res) => {
                        console.log("转发成功", res);
                    },
                    fail: (res) => {
                        console.log("转发失败", res)
                    },
                }
            })

        })
    }
    shareApp() {
        return new Promise((resolve, reject) => {
            wx.shareAppMessage({
                title: 'testShare',
                imageUrl: canvas.toTempFilePathSync({
                    destWidth: 500,
                    destHeight: 400
                })
            })
        })
    }
    openDataContext = new WxgameOpenDataContext();
}
window.platform = new WxgamePlatform();

//require('./platform.js') 在微信开发小工具里的项目中的game.js添加该引入