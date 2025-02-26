
import { Link } from "react-router-dom";

const NotFoundState = () => {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">Lesson Plan Not Found</h1>
      <Link to="/dashboard" className="text-primary hover:underline">
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundState;
