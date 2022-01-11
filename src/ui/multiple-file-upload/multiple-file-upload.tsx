import { defineComponent, PropType, ref, Ref, onMounted, nextTick } from 'vue'
import IAxiosInterface from '@/IAxiosInterface'

import './multiple-file-upload.sass'

export type FileData = {
  id: string,
  name: string,
  file: string,
  extension: string
}

export default defineComponent({
  props: {
    apiService: {
      type: Object as PropType<IAxiosInterface>,
      required: true
    },
    endpoint: {
      type: String,
      default: '/file/'
    },
    files: {
      type: Array as PropType<FileData[]>,
      required: true
    },
    onUpload: {
      type: Function as PropType<(files: FileData[]) => void>,
      required: true
    }
  },

  setup (props) {
    const isImage = (file: FileData) => {
      return ['jpg', 'png'].indexOf(file.extension) > -1
    }

    const removeFiles = () => {
      props.files.forEach(file => {
        props.apiService.delete(props.endpoint + file.id)
      })

      props.onUpload([])
    }

    const removeFile = (index: number) => {
      props.apiService.delete(props.endpoint + props.files[index].id)
      const splicedFiles = [...props.files]
      splicedFiles.splice(index, 1)
      props.onUpload(splicedFiles)
    }

    const uploadFiles = async (files: string[] | FileList | File[]) => {
      if (files instanceof FileList) files = Array.from(files)

      const results = await Promise.all((files as Array<File | string>).map(file => {
        const formData = new FormData()
        formData.append('file', file)
        return props.apiService.post(props.endpoint, formData)
      }))

      const uploadedFiles = results.map(response => ({
        id: response.data.id,
        name: response.data.name,
        file: response.data.file,
        extension: response.data.extension
      }))

      props.onUpload([...props.files, ...uploadedFiles])
    }

    const uploadInput = ref(null) as unknown as Ref<HTMLFormElement>

    onMounted(() => {
      nextTick(() => {
        uploadInput.value.addEventListener('change', (e: Event) => {
          uploadFiles((e.target as HTMLFormElement).files)
        })
      })
    })

    return () => (
      <div class="apptimizm-ui-multiple-upload">
        <div class="apptimizm-ui-multiple-upload-drop-area">
          <input type="file" multiple="true" ref={uploadInput}/>
          <div class="apptimizm-ui-multiple-upload-drop-area-icon"/>
          <p class="apptimizm-ui-multiple-upload-drop-area-text-1">Нажмите или перетащите файл в эту область, чтобы загрузить документ</p>
          <p class="apptimizm-ui-multiple-upload-drop-area-text-2">Вы можете загрузить файлы форматов: jpg, png, pdf</p>
        </div>
        { props.files.length > 0 && (
          <div>
            <div class="apptimizm-ui-multiple-upload-actions">
              <span>Файлов: { props.files.length }</span>
              <span onClick={removeFiles}>Удалить все</span>
            </div>
            <div class="apptimizm-ui-multiple-upload-files">
              { props.files.map((file, index) => {
                const background = isImage(file) ? `background-image: url(${file.file})` : ''

                return (
                  <a class="apptimizm-ui-multiple-upload-file" href={file.file} target="_blank">
                    <div
                      class="apptimizm-ui-multiple-upload-file-image"
                      style={background}
                    >
                      <div class="apptimizm-ui-multiple-upload-file-remove" onClick={(e: Event) => { e.preventDefault(); removeFile(index) }}/>
                    </div>
                    <div class="apptimizm-ui-multiple-upload-file-text">{ file.name }</div>
                  </a>
                )
              }) }
            </div>
          </div>
        ) }
      </div>
    )
  }
})
