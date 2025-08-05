import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCommerce } from '@/context/CommerceContext';
import {
  FileText,
  Save,
  Eye,
  Edit,
  Plus,
  Variable,
  AlertCircle
} from 'lucide-react';

export default function AgreementSettings() {
  const { sdk } = useCommerce();
  const { toast } = useToast();
  const [agreement, setAgreement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    variables: {}
  });
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadAgreement();
  }, []);

  const loadAgreement = async () => {
    if (!sdk) return;

    try {
      const agreementData = await sdk.getActiveSellerAgreement();
      setAgreement(agreementData);
      if (agreementData) {
        setFormData({
          content: agreementData.content,
          variables: agreementData.variables || {}
        });
      }
    } catch (error) {
      console.error('Error loading agreement:', error);
      toast({
        title: "Error",
        description: "Failed to load seller agreement.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sdk) return;

    try {
      await sdk.createSellerAgreement({
        content: formData.content,
        variables: formData.variables
      });

      toast({
        title: "Success",
        description: "Seller agreement updated successfully!"
      });

      setIsEditing(false);
      loadAgreement();
    } catch (error) {
      console.error('Error saving agreement:', error);
      toast({
        title: "Error",
        description: "Failed to save seller agreement.",
        variant: "destructive"
      });
    }
  };

  const addVariable = () => {
    const key = prompt('Enter variable name (without {{}}):');
    if (key && !formData.variables[key]) {
      const value = prompt(`Enter default value for {{${key}}}:`);
      if (value !== null) {
        setFormData(prev => ({
          ...prev,
          variables: {
            ...prev.variables,
            [key]: value
          }
        }));
      }
    }
  };

  const updateVariable = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [key]: value
      }
    }));
  };

  const removeVariable = (key: string) => {
    if (confirm(`Remove variable {{${key}}}?`)) {
      const newVariables = { ...formData.variables };
      delete newVariables[key];
      setFormData(prev => ({
        ...prev,
        variables: newVariables
      }));
    }
  };

  const renderPreview = () => {
    let content = formData.content;
    Object.entries(formData.variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
    });
    return content;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Seller Agreement</h1>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Seller Agreement</h1>
          <p className="text-muted-foreground">
            Manage the agreement that sellers must accept during onboarding
          </p>
        </div>
        <div className="flex gap-2">
          {agreement && !isEditing && (
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Edit View' : 'Preview'}
            </Button>
          )}
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Agreement
            </Button>
          ) : (
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {!agreement && !isEditing ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No seller agreement</h3>
            <p className="text-muted-foreground mb-4">
              Create a seller agreement that new sellers must accept during onboarding.
            </p>
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Agreement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Variables</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Define dynamic variables that will be replaced in the agreement text
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Current Variables</h4>
                  <Button variant="outline" size="sm" onClick={addVariable}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </div>
                
                {Object.entries(formData.variables).length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No variables defined. Click "Add Variable" to create dynamic content.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(formData.variables).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Badge variant="outline">
                          <Variable className="h-3 w-3 mr-1" />
                          {`{{${key}}}`}
                        </Badge>
                        <Input
                          value={value as string}
                          onChange={(e) => updateVariable(key, e.target.value)}
                          placeholder="Variable value"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeVariable(key)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? 'Agreement Content' : 'Current Agreement'}
                {agreement && (
                  <Badge variant="secondary" className="ml-2">
                    {agreement.version}
                  </Badge>
                )}
              </CardTitle>
              {isEditing && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Variable Usage:</p>
                    <p>Use double curly braces for variables: {`{{variable_name}}`}</p>
                    <p>Example: {`{{platform_name}}`} will be replaced with the platform name</p>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <Label htmlFor="content">Agreement Text</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter the seller agreement content..."
                    rows={20}
                    className="mt-2 font-mono text-sm"
                  />
                </div>
              ) : (
                <div className="prose max-w-none">
                  {previewMode ? (
                    <div className="whitespace-pre-wrap">
                      {renderPreview()}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
                      {formData.content}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                if (agreement) {
                  setFormData({
                    content: agreement.content,
                    variables: agreement.variables || {}
                  });
                }
              }}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Agreement
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
