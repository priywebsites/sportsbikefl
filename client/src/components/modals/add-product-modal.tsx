import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertProductSchema, InsertProduct } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image, Plus } from "lucide-react";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = insertProductSchema.extend({
  images: insertProductSchema.shape.images.optional(),
});

export function AddProductModal({ open, onOpenChange }: AddProductModalProps) {
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");

  const form = useForm<InsertProduct>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "0",
      discount: "0",
      discountType: "percentage",
      category: "motorcycles",
      stockQuantity: 1,
      stockStatus: "in_stock",
      images: [],
      featured: false,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product created",
        description: "The product has been successfully added to your inventory.",
      });
      form.reset();
      setUploadedImages([]);
      setDescription("");
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-fill deposit info when needed
  const getDepositInfo = () => `
Deposit Policy:
• $500 deposit required to hold unit
• Deposit locks in the motorcycle for up to 30 days
• Applied toward the final purchase price
• Ensures exclusive reservation of the bike`;

  // Format description with bullet points
  const formatDescription = (desc: string) => {
    if (!desc) return "";
    
    // Add deposit info if it's a motorcycle
    const selectedCategory = form.getValues("category");
    let formattedDesc = desc;
    
    if (selectedCategory === "motorcycles") {
      formattedDesc += "\n\n" + getDepositInfo();
    }
    
    return formattedDesc;
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setUploadedImages(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: InsertProduct) => {
    const finalDescription = formatDescription(description);
    
    createProductMutation.mutate({
      ...data,
      description: finalDescription,
      images: uploadedImages,
      price: data.price.toString(),
      discount: data.discount?.toString() || "0",
    });
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset();
      setUploadedImages([]);
      setDescription("");
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="add-product-modal">
        <DialogHeader>
          <DialogTitle>Add New Item to Inventory</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Category Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category" className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="motorcycles">Motorcycles</SelectItem>
                          <SelectItem value="oem parts">OEM Parts</SelectItem>
                          <SelectItem value="used parts">Used Parts</SelectItem>
                          <SelectItem value="custom wheels">Custom Wheels</SelectItem>
                          <SelectItem value="tires">Tires</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Image Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Upload Product Images</p>
                    <p className="text-muted-foreground">Click to select multiple images or drag and drop</p>
                    <Button type="button" variant="outline" className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Choose Images
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  
                  {/* Image Preview Grid */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product title" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description/Specs */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description/Specifications</label>
                  <Textarea
                    rows={6}
                    placeholder="Enter detailed description and specifications. Use bullet points (•) for better formatting:&#10;&#10;• Feature 1&#10;• Feature 2&#10;• Specification detail&#10;• Additional information"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    data-testid="textarea-description"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Use bullet points (•) for better formatting. For motorcycles, deposit info will be automatically added.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing and Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            data-testid="input-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-stock-quantity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Auto-filled Deposit Information Preview */}
            {form.watch("category") === "motorcycles" && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Auto-Added Deposit Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-green-700 space-y-1">
                    <p className="font-medium">The following will be automatically added to the description:</p>
                    <div className="bg-white p-3 rounded border mt-2">
                      <p className="font-medium mb-2">Deposit Policy:</p>
                      <ul className="space-y-1 text-sm">
                        <li>• $500 deposit required to hold unit</li>
                        <li>• Deposit locks in the motorcycle for up to 30 days</li>
                        <li>• Applied toward the final purchase price</li>
                        <li>• Ensures exclusive reservation of the bike</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProductMutation.isPending}
                data-testid="button-add-product"
                className="bg-red-600 hover:bg-red-700"
              >
                {createProductMutation.isPending ? "Adding to Inventory..." : "Add to Inventory"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}