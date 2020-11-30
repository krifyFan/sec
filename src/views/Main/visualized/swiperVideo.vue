<template>
  	<div class="swiper-all-wrap">
		<div class="carousel-wrap">
			<!-- 向左按钮 -->
			<div class="left-icon direction-icon" @click="handlePre()">
				<i class="el-icon-caret-left"></i>
			</div>
			<VideoBox ref="videoBoxRef" class="video-box"></VideoBox>
			<!-- 向右按钮 -->
			<div class="right-icon direction-icon" @click="handleNext()">
				<i class="el-icon-caret-right"></i>
			</div>
		</div>
		<div class="video_screen">
			<!-- <p class="tit">视频画面</p> -->
			<ul class="screen_box">
				<li class="screen_item" @click="ArrangeWindow(1)"></li>
				<li class="screen_item" @click="ArrangeWindow(4)"></li>
				<li class="screen_item" @click="ArrangeWindow(9)"></li>
			</ul>
		</div>
	</div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator"; 
import VideoBox from "@/components/Video/VideoSquaredBox.vue";
import { getVideoDtos } from '@/api/video'
@Component({
	components: { VideoBox }
})
export default class swiperVideo extends Vue {
	$refs: {
		videoBoxRef: HTMLFormElement;
    };

	videoGroups: any[] = []

	videoSliceGroup: any[] = []

	currentIndex:number = 0

	setTimeoutT: any

	mounted() {
		this.getVideo()	
		this.ArrangeWindow(9)
	}

    // 获取视频分组
    getVideo() {
        getVideoDtos().then((res) => {
            let { code, data } = res.data;
            if (code != 200) return;
            this.videoGroups = data;
            // 给每一项加分组名称是否可编辑和视频是否可编辑属性
            this.videoGroups.forEach((ele) => {
                Object.assign(ele, {
                    isVideoGroupsEdited: true,
                    isEdited: false,
                });
			});
        });
	}

	ArrangeWindow(x) {
		this.$refs.videoBoxRef.ArrangeWindowChildren(x);
		setTimeout(()=> {
			if (this.videoGroups.length > 0) {
				this.videoSliceGroup = []
				this.videoSliceGroup = this.sliceArr(this.videoGroups, x)
				this.autoPlay()
			} else {
				this.$Message.warning('该场站下无视频')
			}
		}, 300)
	}
	// 数组等比例分组
	sliceArr(arr, size) {
		let index = 0
		let newArr = []
		while(index < arr.length) {
			newArr.push(arr.slice(index, index += size))
		}
		return newArr
	}

	// 点击视频列表每一项
    selectVideosItem(videosItem) {
        // this.isVideosItemActived = videosItem.name;
        // this.curVideosItem = videosItem;
        this.$refs.videoBoxRef.setCurrentVideo(videosItem);
	}

	autoPlay(defaultI = 0) {
		for(let i=defaultI; i<=this.videoSliceGroup.length; i++) {
			this.setTimeoutT = setTimeout(()=>{
				this.currentIndex = i
				this.selectVideosItem(this.videoSliceGroup[this.currentIndex])
				if (i === this.videoSliceGroup.length) {
					this.autoPlay()
				}
			}, i*2000)
		}
	}

	stopPlay() {
		clearTimeout(this.setTimeoutT)
	}

	handlePre() {
		this.stopPlay()
		if(this.currentIndex===0){
			this.currentIndex = this.videoSliceGroup.length-1
		}else{
			this.currentIndex -= 1
		}
		this.autoPlay(this.currentIndex)
	}
	handleNext() {
		this.stopPlay()
		if(this.currentIndex === this.videoSliceGroup.length-1){
			this.currentIndex = 0
		}else{
			this.currentIndex += 1
		}
		this.autoPlay(this.currentIndex)
	}

	destroyed() {
		this.stopPlay()
	}
}
</script>
<style lang="less">
.swiper-all-wrap {
	background-color: #0d1736;
    height: 100%;
	width: 100%;
	color: #ffffff;
	display: flex;
	flex-direction: column;
	.video_screen {
		flex: 1;
		display: flex;
		justify-content: space-around;
		align-items: flex-end;
		width: 100%;
		height: 100%;
		text-align: right;
		flex-direction: column;
		// .tit {
		// 	margin-right: 10px;
		// }
		.screen_box {
			display: flex;
			height: 50px;
			width: 150px;
			li {
				list-style: none;
				flex: 1;
				margin-right: 5px;
				cursor: pointer;
				&:nth-child(1) {
					background: url("../../../assets/images/screen_one.png")
                        no-repeat;
				}
				&:nth-child(2) {
					background: url("../../../assets/images/screen_four.png")
						no-repeat;
					// background-size: 100% 100%;
				}
				&:nth-child(3) {
					background: url("../../../assets/images/screen_nine.png")
						no-repeat;
					// background-size: 100% 100%;
				}
			}


		}
	}
	.carousel-wrap {
		flex: 10;
		height: 100%;
		overflow: hidden;
		position: relative;
		display: flex;
		justify-content: space-between;
    	align-items: center;
		.direction-icon {
			flex: 1;
			height: 32px;
			width: 32px;
			border-radius: 30px;
			cursor: pointer;
			text-align: center;
		}
		.video-box {
			flex: 30;
			margin-top: 10px;
		}
	}
}
</style>