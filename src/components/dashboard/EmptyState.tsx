
interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center">
      <div className="max-w-md">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
};

export default EmptyState;
