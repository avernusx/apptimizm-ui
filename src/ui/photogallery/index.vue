<template lang="pug">
	.gallery(v-if="active" @click="closeGallery" @mouseup="onDragEnd")
		.arrow-close
			.arrow-close-icon(@click="closeGallery")
				include ./assets/arrow-back.svg
			div.slot-top(@click.stop)
				slot(name="top-content")
		.gallery-modal
			.flex-content
				.arrow-back
					.btn(v-if="activeImageIndex !== 0" @click.stop="changeMainImage(-1)")
						include ./assets/arrow-change.svg
				.image-content(@click.stop)
					.image-wrapper(ref="imageWrapper")
						img(@click.stop @wheel.prevent="onScroll" @dragstart.prevent @mousedown="onDragStart" @mousemove="onMouseMove" ref="mainImage" :src="images[activeImageIndex].url" :style="stylesForImg" :key="images[activeImageIndex].url")
					.image-controls
						.flex.mr-2
							.btn(@click.stop="rotateImg(-90)")
								include ./assets/rotate.svg
							.btn(@click.stop="rotateImg(90)")
								include ./assets/rotate2.svg
						.flex
							.btn(@click.stop="changeScale(-0.1)")
								include ./assets/minus.svg
							.btn(@click.stop="resetScale")
								include ./assets/zoom-default.svg
							.btn(@click.stop="changeScale(0.1)")
								include ./assets/plus.svg
							.btn(@click.stop="download(images[activeImageIndex].url, images[activeImageIndex].name)")
								include ./assets/download.svg
					.slider.mt-3(:class="{ 'slider--short': images.length <= countSmallImages }")
						.move-slider.btn(@click.stop="moveSlider(-1)")
							include ./assets/arrow-change.svg
						.slider-image(v-for="(image, index) in sliderImages" @click.stop="setImageFromSlider(index)" :class="{ 'active': image.url === images[activeImageIndex].url }")
							img(:src="image.url")
						.move-slider.btn(@click.stop="moveSlider(1)")
							.rotate
								include ./assets/arrow-change.svg
				.arrow-next
					.btn.rotate(v-if="activeImageIndex !== images.length - 1" @click.stop="changeMainImage(1)")
						include ./assets/arrow-change.svg
</template>

<script>
import debounce from 'lodash/debounce'

export default {
	props: {
		active: {
			type: Boolean,
			required: true,
		},
		activeImageIndex: {
			type: Number,
			required: true,
		},
		images: {
			type: Array,
			required: true,
		},
		activeChange: {
			type: Function
		},
		indexChange: {
			type: Function
		}
	},
	data() {
		return {
			sliderOffset: 0,
			countSmallImages: 6,
			scale: 1,
			left: 0,
			top: 0,
			rotate: 0,
			lastX: 0,
			lastY: 0,
			dragged: false,
			widthOffset: 0,
			heightOffset: 0,
			onMouseMove: debounce((e) => {
				this.onDragMove(e)
			}, 0)
		}
	},
	computed: {
		stylesForImg() {
			return { transform: `scale(${this.scale}) translateX(${this.left}px) translateY(${this.top}px) rotate(${this.rotate}deg)` }
		},
		sliderImages() {
			return this.images.slice(this.sliderOffset, this.sliderOffset + this.countSmallImages)
		},
	},
	methods: {
		download(url, name) {
			this.$axios({
				url,
				method: 'GET',
				responseType: 'blob'
			}).then((response) => {
				const filename = name ? name : url.split('/').pop()
				const blob = window.URL.createObjectURL(new Blob([response.data]))
				const link = document.createElement('a')
				link.href = blob
				link.setAttribute('download', filename)
				link.click()
			})
		},
		onKeyDown(e) {
			if (this.active && !e.repeat) {
				if (e.keyCode === 37 && this.activeImageIndex !== 0) this.changeMainImage(-1)
				if (e.keyCode === 39 && this.activeImageIndex !== this.images.length - 1) this.changeMainImage(1)
			}
		},
		onScroll(e) {
			let deltaScale = e.deltaY > 0 ? -0.1 : 0.1
			this.changeScale(deltaScale)
		},
		onDragStart(e) {
			this.dragged = true
			this.lastX = e.screenX
			this.lastY = e.screenY
			this.setImgMaxOffset()
		},
		onDragMove(e) {
			if (!this.dragged) return
			if (this.widthOffset > 0) {
				this.left += e.screenX - this.lastX
				this.left = Math.max(-this.widthOffset, Math.min(this.left, this.widthOffset))
			}
			if (this.heightOffset > 0) {
				this.top += e.screenY - this.lastY
				this.top = Math.max(-this.heightOffset, Math.min(this.top, this.heightOffset))
			}
			this.lastX = e.screenX
			this.lastY = e.screenY
		},
		onDragEnd(e) {
			this.dragged = false
		},
		setImgMaxOffset() {
			const originalWidth = this.$refs.mainImage.naturalWidth
			const originalHeight = this.$refs.mainImage.naturalHeight
			const wrapperWidth = this.$refs.imageWrapper.clientWidth
			const wrapperHeight = this.$refs.imageWrapper.clientHeight
			const kf = originalWidth / originalHeight
			let imageHeight, imageWidth = null
			if (kf > 1) {
				imageWidth = wrapperWidth * this.scale
				imageHeight = imageWidth / kf
			} else {
				imageHeight = wrapperHeight * this.scale
				imageWidth = imageHeight * kf
			}
			this.widthOffset = (imageWidth - wrapperWidth) / this.scale / 2
			this.heightOffset = (imageHeight - wrapperHeight) / this.scale / 2
		},
		moveSlider(deltaMove) {
			this.sliderOffset += deltaMove
			this.sliderOffset = Math.max(0, Math.min(this.sliderOffset, this.images.length - this.countSmallImages))
			this.$emit('sliderMover', this.sliderOffset, this.countSmallImages)
		},
		setImageFromSlider(sliderIndex) {
			this.changeMainImage(this.sliderOffset + sliderIndex - this.activeImageIndex)
		},
		changeScale(deltaScale) {
			this.scale += deltaScale
			this.scale = +Math.max(0.5, Math.min(this.scale, 3)).toFixed(1)
		},
		rotateImg(delta) {
			this.rotate += delta
		},
		resetScale() {
			this.scale = 1
			this.left = 0
			this.top = 0
		},
		changeMainImage(deltaIndex) {
			this.resetScale()
			let newIndex = this.activeImageIndex + deltaIndex
			if (newIndex >= 0 && newIndex <= this.images.length) {
				this.$emit('update:activeImageIndex', newIndex)
				this.indexChange && this.indexChange(newIndex)
				if (this.sliderOffset + this.countSmallImages <= newIndex) {
					this.moveSlider(1)
				} else if (newIndex < this.sliderOffset) {
					this.moveSlider(-1)
				}
			}
		},
		closeGallery() {
			this.$emit('update:active', false)
			this.activeChange && this.activeChange(false)
		},
	},
	watch: {
		active(newValue) {
			if (newValue) {
				this.sliderOffset = Math.min(Math.max(0, this.images.length - this.countSmallImages), this.activeImageIndex)
				document.addEventListener('keydown', this.onKeyDown)
			} else {
				document.removeEventListener('keydown', this.onKeyDown)
			}
		}
	},
}
</script>

<style lang="sass" scoped>
.slider
	height: 18%
	display: flex
	justify-content: center
	grid-gap: 12px
	position: relative
	overflow: hidden
	.move-slider
		height: 100%
		width: 32px
		display: flex
		justify-content: center
		align-items: center
		background-color: rgba(59, 67, 96, 0.5)
		cursor: pointer
		&:first-child
			left: 0
		&:last-child
			right: 0
.slider--short
	justify-content: center
	.move-slider
		display: none
.slider-image
	border-radius: 4px
	height: 100%
	overflow: hidden
	cursor: pointer
	max-width: 20%
	width: 100%
	img
		width: 100%
		height: 100%
		object-fit: fill
		background: #F7F7FE url("./assets/preloader.svg") center center no-repeat
	&.active
		border: 2px solid #64D0DA
.image-controls
	width: 100%
	display: flex
	justify-content: center
	margin-top: 12px
.arrow-back,
.arrow-next
	width: 42px
	height: 42px
.arrow-close
	position: absolute
	top: 12%
	left: 9%
	display: flex
	width: 91%
	z-index: 111
.arrow-close-icon
	cursor: pointer
.slot-top
	width: 100%
.btn
	cursor: pointer
	height: 42px
	width: 42px
	background-color: rgba(59, 67, 96, 0.5)
	display: flex
	transition: .2s background-color
	&:hover
		background-color: rgba(59, 67, 96, 1)
	&:first-child
		border-top-left-radius: 5px
		border-bottom-left-radius: 5px
	&:last-child
		border-top-right-radius: 5px
		border-bottom-right-radius: 5px
.btn svg
	margin: auto
.gallery
	user-select: none
	position: fixed
	top: 0
	bottom: 0
	left: 0
	right: 0
	background: rgba(59, 67, 96, 0.8)
	z-index: 100
	display: flex
.gallery-modal
	position: relative
	margin: auto
	border-radius: 5px
	width: 100%
	height: 100%
.flex-content
	display: flex
	justify-content: space-around
	align-items: center
	align-self: center
	width: 100%
	height: 100%
	padding-top: 0%
.image-content
	width: 100%
	height: 100%
	max-width: 55%
	max-height: 55%
.image-wrapper
	width: 100%
	height: 100%
	overflow: hidden
	border-radius: 5px
	img
		width: 100%
		height: 100%
		object-fit: contain
		user-select: none
		border-radius: 5px
		transform-origin: center center
		display: block
		cursor: grab
.rotate
	transform: rotate(180deg)
</style>
