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
import { Separator } from "@/components/ui/separator";
import { insertProductSchema, InsertProduct } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image, Plus, FileText, Settings } from "lucide-react";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct?: any;
}

const formSchema = insertProductSchema.extend({
  images: insertProductSchema.shape.images.optional(),
});

export function AddProductModal({ open, onOpenChange, editingProduct }: AddProductModalProps) {
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  const [keySpecs, setKeySpecs] = useState("");

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
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const response = await apiRequest(method, url, productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: editingProduct ? "Product updated" : "Product created",
        description: editingProduct 
          ? "The product has been successfully updated." 
          : "The product has been successfully added to your inventory.",
      });
      form.reset();
      setUploadedImages([]);
      setDescription("");
      setKeySpecs("");
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${editingProduct ? 'update' : 'create'} product. Please try again.`,
        variant: "destructive",
      });
    },
  });

  // Auto-fill deposit info for motorcycles
  const getDepositInfo = () => `

DEPOSIT POLICY:
• $500 deposit required to hold unit
• Deposit locks in the motorcycle for up to 30 days
• Applied toward the final purchase price
• Ensures exclusive reservation of the bike`;

  // Handle file upload with better quality
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Create a canvas to maintain image quality
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas size to maintain original aspect ratio
        const maxWidth = 1200; // Maximum width for good quality
        const maxHeight = 800; // Maximum height for good quality
        
        let { width, height } = img;
        
        // Only resize if image is larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image with high quality
        ctx!.imageSmoothingEnabled = true;
        ctx!.imageSmoothingQuality = 'high';
        ctx!.drawImage(img, 0, 0, width, height);
        
        // Convert to high quality JPEG
        const result = canvas.toDataURL('image/jpeg', 0.9); // 90% quality
        setUploadedImages(prev => [...prev, result]);
      };
      
      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImageToFirst = (index: number) => {
    if (index === 0) return; // Already first
    setUploadedImages(prev => {
      const newImages = [...prev];
      const [selectedImage] = newImages.splice(index, 1);
      newImages.unshift(selectedImage);
      return newImages;
    });
  };

  const onSubmit = (data: InsertProduct) => {
    // Format final description with all sections
    let finalDescription = "";
    
    // Add main description
    if (description.trim()) {
      finalDescription += description.trim();
    }
    
    // Add key specifications section
    if (keySpecs.trim()) {
      finalDescription += "\n\nKEY SPECIFICATIONS:\n" + keySpecs.trim();
    }
    
    // Add deposit info for motorcycles
    const selectedCategory = form.getValues("category");
    if (selectedCategory === "motorcycles") {
      finalDescription += getDepositInfo();
    }
    
    createProductMutation.mutate({
      ...data,
      description: finalDescription,
      images: uploadedImages,
      price: data.price.toString(),
      discount: data.discount?.toString() || "0",
    });
  };

  // Reset form when modal opens or populate with editing data
  useEffect(() => {
    if (open) {
      if (editingProduct) {
        // Populate form with existing product data
        const [mainDesc, specsSection, depositSection] = editingProduct.description.split(/\n\n(?=KEY SPECIFICATIONS:|DEPOSIT POLICY:)/);
        
        form.reset({
          title: editingProduct.title,
          description: editingProduct.description,
          price: editingProduct.price,
          discount: editingProduct.discount || "0",
          discountType: editingProduct.discountType || "percentage",
          category: editingProduct.category,
          condition: editingProduct.condition || "new",
          stockQuantity: editingProduct.stockQuantity,
          stockStatus: editingProduct.stockStatus,
          images: editingProduct.images || [],
          featured: editingProduct.featured || false,
        });
        
        setDescription(mainDesc || "");
        
        if (specsSection && specsSection.startsWith("KEY SPECIFICATIONS:")) {
          setKeySpecs(specsSection.replace("KEY SPECIFICATIONS:\\n", "").replace("KEY SPECIFICATIONS:", ""));
        } else {
          setKeySpecs("");
        }
        
        setUploadedImages(editingProduct.images || []);
      } else {
        // Reset for new product
        form.reset({
          title: "",
          description: "",
          price: "0",
          discount: "0",
          discountType: "percentage",
          category: "motorcycles",
          condition: "new",
          stockQuantity: 1,
          stockStatus: "in_stock",
          images: [],
          featured: false,
        });
        setUploadedImages([]);
        setDescription("");
        setKeySpecs("");
      }
    }
  }, [open, editingProduct, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" data-testid="add-product-modal">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingProduct ? `Edit ${editingProduct.title}` : "Add New Item to Inventory"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Category Selection */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Product Category
                </CardTitle>
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

                {/* Condition */}
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-condition">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
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
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Image className="mr-2 h-5 w-5" />
                  Product Images
                </CardTitle>
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
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-red-600">Select Thumbnail (Main Image)</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Upload ${index + 1}`}
                              className={`w-full h-24 object-contain bg-gray-50 rounded-lg border cursor-pointer transition-all ${
                                index === 0 
                                  ? 'ring-2 ring-red-500 border-red-500' 
                                  : 'border-gray-300 hover:border-red-300'
                              }`}
                              onClick={() => moveImageToFirst(index)}
                            />
                            {index === 0 && (
                              <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 rounded">
                                Main
                              </div>
                            )}
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
                      <p className="text-xs text-muted-foreground">
                        Click on any image to set it as the main thumbnail. The main image will be shown first in the product gallery.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Product Information
                </CardTitle>
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
              </CardContent>
            </Card>

            {/* Description Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-red-600">Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">General Description</label>
                  <Textarea
                    rows={4}
                    placeholder="Enter general product description...&#10;&#10;Example:&#10;• High-quality materials and construction&#10;• Professional grade performance&#10;• Suitable for various applications"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    data-testid="textarea-description"
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use bullet points (•) for better readability. Start each point on a new line.
                  </p>
                </div>

                <Separator />

                <div>
                  <label className="block text-sm font-medium mb-2 text-red-600">Key Specifications</label>
                  <Textarea
                    rows={6}
                    placeholder="Enter detailed specifications...&#10;&#10;Example:&#10;• Make: Honda&#10;• Model: CBR1000RR&#10;• Year: 2023&#10;• Engine: 999cc inline-4&#10;• Power: 189 HP&#10;• Transmission: 6-speed&#10;• Weight: 195kg"
                    value={keySpecs}
                    onChange={(e) => setKeySpecs(e.target.value)}
                    data-testid="textarea-key-specs"
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    List technical specifications, features, and important details using bullet points.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Auto-filled Deposit Information Preview */}
            {form.watch("category") === "motorcycles" && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-green-800">Deposit Policy (Auto-Added)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-green-700 space-y-1">
                    <p className="font-medium mb-3">The following deposit policy will be automatically added to all motorcycles:</p>
                    <div className="bg-white p-4 rounded border">
                      <p className="font-semibold mb-2">DEPOSIT POLICY:</p>
                      <div className="space-y-1 text-sm text-left">
                        <div>• $500 deposit required to hold unit</div>
                        <div>• Deposit locks in the motorcycle for up to 30 days</div>
                        <div>• Applied toward the final purchase price</div>
                        <div>• Ensures exclusive reservation of the bike</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing and Stock */}
            <Card>
              <CardHeader className="pb-4">
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
                {createProductMutation.isPending 
                  ? (editingProduct ? "Updating Product..." : "Adding to Inventory...") 
                  : (editingProduct ? "Update Product" : "Add to Inventory")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}