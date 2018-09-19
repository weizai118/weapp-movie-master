Page({
  data:{
    detailMovie:null,    //电影详情
    isFold:false,
    comments:{}   //观众评论
  },
  onLoad(options){
    const movieId = options.movieId || 1203575
    this.initPage(movieId)
  },
  //初始页面
  initPage(movieId){
    const _this = this
    wx.showLoading({
      title: '加载中...',
    })
    this.getComment(movieId)
    wx.request({
      url: `http://m.maoyan.com/ajax/detailmovie?movieId=${movieId}`,
      success(res) {
        wx.hideLoading()
        _this.setData({
          detailMovie: _this.handleData(res.data.detailMovie)
        })
      }
    })
  },
  //获取观众评论
  getComment(movieId){
    const _this = this
    wx.request({
      url: `http://m.maoyan.com/mmdb/comments/movie/${movieId}.json?_v_=yes&offset=1`,
      success(res){
        let comments = {...res.data}
        if (comments.hcmts){
          comments.hcmts = comments.hcmts.slice(0,3)
        }
        console.log(comments)
        _this.setData({
          comments
        })
      }
    })
  },
  //预览图片
  previewImage(e){
    const current = e.currentTarget.dataset.url
    const urls = this.data.detailMovie.photos.map(item => item.replace('180w_140h','375w_250h'))
    wx.previewImage({
      urls,
      current
    })
  },
  //处理数据
  handleData(data){
    //小程序的{{}}中不能调用函数，只能在这里处理数据
    let obj = data
    obj.img = obj.img.replace('w.h','177.249')
    //将类似“v3d imax”转化为['3D','IMAX']
    obj.version = obj.version && obj.version.split(' ').map(item=>{
      return item.toUpperCase().replace('V','')
    })
    //将评分人数单位由个转化为万
    obj.snum = obj.snum/10000
    obj.snum = obj.snum.toFixed(1)
    //评分星星,满分10分，一颗满星代表2分
    let stars = new Array(5).fill('star-empty')
    let fullStars = Math.floor(obj.sc / 2)   //满心的个数
    let halfStar = obj.sc % 2 ? 'star-half' : 'star-empty'        //半星的个数，半星最多1个
    stars.fill('star-full', 0, fullStars)              //填充满星
    if (fullStars<5){
      stars[fullStars] = halfStar;
    }
    obj.stars = stars
    //处理媒体库的图片
    obj.photos = obj.photos.map(item => item.replace('w.h/', '') +'@180w_140h_1e_1c.webp')
    return obj
  },
  //折叠与展开剧情简介
  toggleFold(){
    this.setData({
      isFold:!this.data.isFold
    })
  }

})