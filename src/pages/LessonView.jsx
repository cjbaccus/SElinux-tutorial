import { useParams } from 'react-router-dom';
import { LessonContainer } from '../components/lesson/LessonContainer';

export function LessonView() {
  const { lessonId } = useParams();

  return <LessonContainer lessonId={lessonId} />;
}
