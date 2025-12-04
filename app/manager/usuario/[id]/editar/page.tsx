"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, ArrowLeft } from "lucide-react" 
import Sidebar from "@/components/Sidebar"

// Mock user service for demonstration. Replace with your actual API service.
const usersService = {
  getById: async (id: string): Promise<any> => {
    console.log(`API Call: Fetching user with ID ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    // This mock finds a user from a predefined list.
    const mockUsers = [
      { id: 1, full_name: 'Alice Admin', email: 'alice.admin@example.com', phone: '(11) 98765-4321', role: 'admin' },
      { id: 2, full_name: 'Bruno Gestor', email: 'bruno.g@example.com', phone: '(21) 91234-5678', role: 'gestor' },
      { id: 3, full_name: 'Dr. Carlos Médico', email: 'carlos.med@example.com', phone: null, role: 'medico' },
      { id: 4, full_name: 'Daniela Secretaria', email: 'daniela.sec@example.com', phone: '(31) 99999-8888', role: 'secretaria' },
      { id: 5, full_name: 'Eduardo Usuário', email: 'edu.user@example.com', phone: '(41) 98888-7777', role: 'user' },
    ];
    const user = mockUsers.find(u => u.id.toString() === id);
    if (!user) throw new Error("Usuário não encontrado.");
    return user;
  },
  update: async (id: string, payload: any): Promise<void> => {
    console.log(`API Call: Updating user ${id} with payload:`, payload);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // To simulate an error (e.g., duplicate email), you could throw an error here:
    // if (payload.email === 'bruno.g@example.com') throw new Error("Este e-mail já está em uso por outro usuário.");
  }
};

// Interface for the user form data
interface UserFormData {
  nomeCompleto: string;
  email: string;
  telefone: string;
  papel: string;
  password?: string; // Optional for password updates
}

// Default state for the form
const defaultFormData: UserFormData = {
  nomeCompleto: '',
  email: '',
  telefone: '',
  papel: '',
  password: '',
};

// Helper functions for phone formatting
const cleanNumber = (value: string): string => value.replace(/\D/g, '');
const formatPhone = (value: string): string => {
    const cleaned = cleanNumber(value).substring(0, 11);
    if (cleaned.length > 10) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

export default function EditarUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id; 
  
  const [formData, setFormData] = useState<UserFormData>(defaultFormData);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map API field names to our form field names
  const apiToFormMap: { [key: string]: keyof UserFormData } = {
      'full_name': 'nomeCompleto',
      'email': 'email',
      'phone': 'telefone',
      'role': 'papel'
  };

  // Fetch user data when the component mounts
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const data = await usersService.getById(id);
        if (!data) {
          setError("Usuário não encontrado.");
          setLoading(false);
          return;
        }

        const initialData: Partial<UserFormData> = {};
        Object.keys(data).forEach(key => {
            const formKey = apiToFormMap[key];
            if (formKey) {
                initialData[formKey] = data[key] === null ? '' : String(data[key]);
            }
        });
        
        setFormData(prev => ({ ...prev, ...initialData }));
      } catch (e: any) {
        console.error("Erro ao carregar dados do usuário:", e);
        setError(e.message || "Não foi possível carregar os dados do usuário.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]); 

  const handleInputChange = (key: keyof UserFormData, value: string) => {
    const updatedValue = key === 'telefone' ? formatPhone(value) : value;
    setFormData((prev) => ({ ...prev, [key]: updatedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    
    if (!id) {
        setError("ID do usuário ausente.");
        setIsSaving(false);
        return;
    }

    // Prepare payload for the API
    const payload: { [key: string]: any } = {
      full_name: formData.nomeCompleto,
      email: formData.email,
      phone: formData.telefone.trim() || null,
      role: formData.papel,
    };

    // Only include the password in the payload if it has been changed
    if (formData.password && formData.password.trim() !== '') {
      payload.password = formData.password;
    }

    try {
      await usersService.update(id, payload); 
      router.push("/manager/usuario"); 
    } catch (e: any) {
      console.error("Erro ao salvar o usuário:", e);
      setError(e.message || "Ocorreu um erro inesperado ao atualizar.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="flex justify-center items-center h-full w-full py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Carregando dados do usuário...</p>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
    <div className="w-full max-w-2xl mx-auto space-y-6 p-4 md:p-8"> 
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Editar Usuário: <span className="text-primary">{formData.nomeCompleto}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Atualize as informações do usuário (ID: {id}).
          </p>
        </div>
        <Link href="/manager/usuario">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 border border-border rounded-lg shadow-sm">
        {error && (
             <div className="p-3 rounded-lg border bg-destructive/10 text-destructive border-destructive/30">
                <p className="font-medium">Erro na Atualização:</p>
                <p className="text-sm">{error}</p>
            </div>
        )}

        <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCompleto">Nome Completo</Label>
              <Input
                id="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Nova Senha</Label>
                    <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Deixe em branco para não alterar"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange("telefone", e.target.value)}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="papel">Papel (Função)</Label>
                    <Select value={formData.papel} onValueChange={(v) => handleInputChange("papel", v)}>
                        <SelectTrigger id="papel">
                            <SelectValue placeholder="Selecione uma função" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="gestor">Gestor</SelectItem>
                            <SelectItem value="medico">Médico</SelectItem>
                            <SelectItem value="secretaria">Secretaria</SelectItem>
                            <SelectItem value="user">Usuário</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link href="/manager/usuario">
            <Button type="button" variant="outline" disabled={isSaving}>
              Cancelar
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90"
            disabled={isSaving}
          >
            {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
                <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
    </Sidebar>
  );
}