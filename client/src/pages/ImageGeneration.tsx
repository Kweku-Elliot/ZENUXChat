import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Glassmorphism } from '@/components/ui/glassmorphism';
import { useApp } from '@/contexts/AppContext';
import { useAI } from '@/hooks/useAI';
import { 
  ArrowLeft, 
  Image, 
  Video, 
  Wand2, 
  Download, 
  Share2, 
  Copy,
  Sparkles,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageGenerationProps {
  onBack: () => void;
}

interface GeneratedContent {
  id: string;
  type: 'image' | 'video';
  prompt: string;
  url: string;
  timestamp: string;
  settings: {
    size?: string;
    quality?: string;
    style?: string;
    duration?: number;
  };
}

export function ImageGeneration({ onBack }: ImageGenerationProps) {
  const { user, isOnline } = useApp();
  const { generateImage, generateVideo } = useAI();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<'image' | 'video'>('image');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [imageQuality, setImageQuality] = useState('standard');
  const [videoStyle, setVideoStyle] = useState('realistic');
  const [videoDuration, setVideoDuration] = useState(5);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imageSizes = [
    { value: '1024x1024', label: '1024x1024 (Square)' },
    { value: '1024x1792', label: '1024x1792 (Portrait)' },
    { value: '1792x1024', label: '1792x1024 (Landscape)' },
  ];

  const imageQualities = [
    { value: 'standard', label: 'Standard' },
    { value: 'hd', label: 'HD (Higher cost)' },
  ];

  const videoStyles = [
    { value: 'realistic', label: 'Realistic' },
    { value: 'animated', label: 'Animated' },
    { value: 'artistic', label: 'Artistic' },
  ];

  const examplePrompts = [
    "A futuristic cityscape at sunset with flying cars",
    "A magical forest with glowing mushrooms and fireflies", 
    "A professional portrait of a confident business person",
    "An abstract painting with vibrant colors and geometric shapes",
    "A cozy coffee shop interior with warm lighting",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please enter a description for what you want to generate",
        variant: "destructive",
      });
      return;
    }

    if (!isOnline) {
      toast({
        title: "Offline Mode",
        description: "Image and video generation requires an internet connection",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      let result;
      
      if (contentType === 'image') {
        result = await generateImage.mutateAsync({ prompt });
      } else {
        result = await generateVideo.mutateAsync({ 
          prompt,
          duration: videoDuration 
        });
      }

      const newContent: GeneratedContent = {
        id: crypto.randomUUID(),
        type: contentType,
        prompt,
        url: result.url || '/placeholder-image.jpg', // Fallback for demo
        timestamp: new Date().toISOString(),
        settings: {
          size: contentType === 'image' ? imageSize : undefined,
          quality: contentType === 'image' ? imageQuality : undefined,
          style: contentType === 'video' ? videoStyle : undefined,
          duration: contentType === 'video' ? videoDuration : undefined,
        },
      };

      setGeneratedContent(prev => [newContent, ...prev]);
      setGenerationProgress(100);

      toast({
        title: "Generation complete",
        description: `Your ${contentType} has been generated successfully`,
      });

      // Clear prompt after successful generation
      setPrompt('');

    } catch (error) {
      toast({
        title: "Generation failed",
        description: `Failed to generate ${contentType}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  const handleDownload = (content: GeneratedContent) => {
    // In production, this would trigger actual download
    toast({
      title: "Download started",
      description: `Downloading ${content.type}...`,
    });
  };

  const handleShare = (content: GeneratedContent) => {
    if (navigator.share) {
      navigator.share({
        title: `Generated ${content.type}`,
        text: content.prompt,
        url: content.url,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(content.url).then(() => {
        toast({
          title: "Link copied",
          description: "Share link copied to clipboard",
        });
      });
    }
  };

  const handlePromptSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const regenerateContent = (content: GeneratedContent) => {
    setPrompt(content.prompt);
    setContentType(content.type);
    if (content.settings.size) setImageSize(content.settings.size);
    if (content.settings.quality) setImageQuality(content.settings.quality);
    if (content.settings.style) setVideoStyle(content.settings.style);
    if (content.settings.duration) setVideoDuration(content.settings.duration);
    
    handleGenerate();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
          <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <span>AI Generation Studio</span>
          </h1>
          <p className="text-muted-foreground">Create stunning images and videos with AI</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Generation Panel */}
          <div className="space-y-6">
            {/* Content Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>What do you want to create?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={contentType === 'image' ? 'default' : 'outline'}
                    onClick={() => setContentType('image')}
                    className="h-20 flex flex-col space-y-2"
                    data-testid="button-select-image"
                  >
                    <Image className="w-6 h-6" />
                    <span>Image</span>
                  </Button>
                  <Button
                    variant={contentType === 'video' ? 'default' : 'outline'}
                    onClick={() => setContentType('video')}
                    className="h-20 flex flex-col space-y-2"
                    data-testid="button-select-video"
                  >
                    <Video className="w-6 h-6" />
                    <span>Video</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Prompt Input */}
            <Card>
              <CardHeader>
                <CardTitle>Describe your vision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder={`Describe the ${contentType} you want to create...`}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                    data-testid="input-prompt"
                  />
                </div>

                {/* Example Prompts */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Example prompts:</Label>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.slice(0, 3).map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => handlePromptSuggestion(example)}
                        data-testid={`button-example-${index}`}
                      >
                        {example.length > 30 ? example.slice(0, 30) + '...' : example}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Generation Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contentType === 'image' ? (
                  <>
                    <div>
                      <Label htmlFor="image-size">Image Size</Label>
                      <Select value={imageSize} onValueChange={setImageSize}>
                        <SelectTrigger data-testid="select-image-size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {imageSizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="image-quality">Quality</Label>
                      <Select value={imageQuality} onValueChange={setImageQuality}>
                        <SelectTrigger data-testid="select-image-quality">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {imageQualities.map((quality) => (
                            <SelectItem key={quality.value} value={quality.value}>
                              {quality.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="video-style">Style</Label>
                      <Select value={videoStyle} onValueChange={setVideoStyle}>
                        <SelectTrigger data-testid="select-video-style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {videoStyles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="video-duration">Duration (seconds)</Label>
                      <Input
                        id="video-duration"
                        type="number"
                        min="3"
                        max="30"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(parseInt(e.target.value) || 5)}
                        data-testid="input-video-duration"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              className="w-full h-12 gradient-primary text-lg font-medium"
              disabled={!prompt.trim() || isGenerating || !isOnline}
              data-testid="button-generate"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              {isGenerating ? 'Generating...' : `Generate ${contentType}`}
            </Button>

            {/* Progress */}
            {isGenerating && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generating your {contentType}...</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Usage Info */}
            {user && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Plan: {user.plan.type.charAt(0).toUpperCase() + user.plan.type.slice(1)}</p>
                    {user.plan.type === 'free' && (
                      <p className="text-amber-600">Upgrade to access image/video generation</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Generated Content Gallery */}
          <div className="space-y-6">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated Content</span>
                  <Badge variant="outline">
                    {generatedContent.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] p-4">
                  {generatedContent.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No content generated yet</p>
                      <p className="text-sm mt-1">Create your first image or video!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {generatedContent.map((content) => (
                        <Card key={content.id} data-testid={`generated-${content.id}`}>
                          <CardContent className="p-4">
                            {/* Content Preview */}
                            <div className="relative mb-3">
                              {content.type === 'image' ? (
                                <img
                                  src={content.url}
                                  alt={content.prompt}
                                  className="w-full h-40 object-cover rounded-lg bg-muted"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center relative">
                                  <Play className="w-12 h-12 text-muted-foreground" />
                                  <Badge className="absolute top-2 right-2">
                                    {content.settings.duration}s
                                  </Badge>
                                </div>
                              )}
                            </div>

                            {/* Content Info */}
                            <div className="space-y-2">
                              <p className="text-sm font-medium line-clamp-2">
                                {content.prompt}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>{content.type}</span>
                                <span>•</span>
                                <span>{new Date(content.timestamp).toLocaleDateString()}</span>
                                {content.settings.size && (
                                  <>
                                    <span>•</span>
                                    <span>{content.settings.size}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(content)}
                                data-testid="button-download"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShare(content)}
                                data-testid="button-share"
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => regenerateContent(content)}
                                data-testid="button-regenerate"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageGeneration;
