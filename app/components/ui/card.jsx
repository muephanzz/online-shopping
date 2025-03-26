export function Card({ children, className }) {
    return (
      <div className={`p-4 border rounded-lg shadow ${className}`}>
        {children}
      </div>
    );
  }
  
  export function CardContent({ children }) {
    return <div className="p-4">{children}</div>;
  }
  