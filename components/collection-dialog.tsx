"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Collection {
  id: string
  name: string
  requests: any[]
}

interface CollectionDialogProps {
  collections: Collection[]
  onCreateCollection: (collection: Collection) => void
}

export function CollectionDialog({ collections, onCreateCollection }: CollectionDialogProps) {
  const [open, setOpen] = useState(false)
  const [collectionName, setCollectionName] = useState("")

  const handleCreate = () => {
    if (!collectionName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a collection name",
        variant: "destructive",
      })
      return
    }

    const newCollection: Collection = {
      id: Date.now().toString(),
      name: collectionName.trim(),
      requests: [],
    }

    onCreateCollection(newCollection)
    setCollectionName("")
    setOpen(false)

    toast({
      title: "Collection created",
      description: `Created "${collectionName}" collection`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="collection-name">Collection Name</Label>
            <Input
              id="collection-name"
              placeholder="My Collection"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate()
                }
              }}
            />
          </div>
          <Button onClick={handleCreate} className="w-full">
            Create Collection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
