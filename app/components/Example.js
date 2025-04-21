import { Button } from "./ui/button";

export default function ExamplePage() {
  return (
    <div className="p-4 space-x-4">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete</Button>
      <Button size="lg">Large Button</Button>
    </div>
  );
}
