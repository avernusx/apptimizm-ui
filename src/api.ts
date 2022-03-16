import useAxios from './composables/use-axios'

const axios = useAxios((config) => {
  return config
})

export default axios
