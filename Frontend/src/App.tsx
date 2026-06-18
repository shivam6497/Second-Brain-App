import { Button } from "@/components/ui/Button";
import { Save, Trash2 } from "lucide-react";

function App() {
  return (
    <div className="p-8 space-y-4">
      <Button>Default</Button>
      <Button variant="dark-purple">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>

      {/* Reduced gap (less space) */}
      <Button className="gap-1">
        <Save className="mr-2 h-4 w-4" />
        Save
      </Button>

      {/* Even tighter gap */}
      <Button className="gap-0.5">
        <Save className="mr-2 h-4 w-4" />
        Save
      </Button>

      {/* No gap */}
      <Button variant="light-purple" className="gap-0">
        <Save className="mr-2 h-4 w-4" />
        Save
      </Button>

      <Button variant="light-purple" size="lg">
        <Save className="mr-2 h-4 w-4" />
        Outline
      </Button>

      <Button variant="secondary">Secondary</Button>

      <Button variant="ghost">Ghost</Button>

      <Button size="sm">Small</Button>

      <Button size="lg">Large</Button>

      <Button onClick={() => alert("clicked!")}>Click Handler</Button>

      <Button disabled>Disabled</Button>
    </div>
  );
}

export default App;
