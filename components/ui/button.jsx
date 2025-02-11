import { cn } from "../../lib/utils";

export function Button({ className, ...props }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors",
        className
      )}
      {...props}
    />
  );
}
