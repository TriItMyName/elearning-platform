import { useNavigate, useParams } from 'react-router-dom'

export function useAdminCourseRoute() {
  const { courseId: rawCourseId } = useParams()
  const navigate = useNavigate()

  const courseId = rawCourseId ? Number(rawCourseId) : null
  const isCourseScoped = courseId != null && !Number.isNaN(courseId)

  const exitCourseScope = () => {
    navigate('/admin/courses')
  }

  return { courseId: isCourseScoped ? courseId : null, isCourseScoped, exitCourseScope }
}
