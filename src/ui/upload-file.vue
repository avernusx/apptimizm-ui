<script lang="tsx">
import IAxiosInterface from '../IAxiosInterface'

interface IUploadFileProps {
  axios: IAxiosInterface,
  modelValue: string,
  placeholder: string,
  endpoint: string,
  errors?: string[],
  onValueChange: (v: string) => void
}

export default (props: IUploadFileProps, context: any) => {
  const onChange = async (files: FileList) => {
    const formData = new FormData()
    formData.append('file', files[0])
    const result = (await props.axios.post(props.endpoint, formData)).data
    context.emit('update:modelValue', result.file)
    props.onValueChange(result.file)
  }

  const errors = Array.isArray(props.errors) ? props.errors : []
  const cls = errors.length ? 'default-input with-errors upload-file' : 'default-input upload-file'

  const getFileName = (name: string) => {
    return name.split('/').reverse()[0].split('?')[0]
  }

  return (
    <div class={cls}>
      <div class="primary-button">{ props.modelValue.length > 0 ? getFileName(props.modelValue) : 'Загрузить' }</div>
      <input type="file" onChange={(e: Event) => onChange((e.target as HTMLFormElement).files)}/>
      { errors.map(error => <div class="error">{error}</div>) }
    </div>
  )
}
</script>

<style lang="sass">
.default-input.upload-file
  position: relative
  input
    position: absolute
    top: 0
    left: 0
    opacity: 0
    height: 100%
    witdh: 100%
</style>
