import GitHub from 'github-api'
import {GH_API_BASE, GH_OWNER, GH_REPO} from '../../constants'

const gh = new GitHub({}, GH_API_BASE)

export const repo = gh.getRepo(GH_OWNER, GH_REPO)
export default gh
