import { toast } from "@/hooks/use-toast";

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class HttpClient {
  private static instance: HttpClient;

  private constructor() {}

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: API_KEY || "",
    };

    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);

      // Tratamento de Erros HTTP Centralizado
      if (!response.ok) {
        // Tenta ler o erro do corpo da resposta
        let errorMessage = `Erro ${response.status}`;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
        } catch {
            errorMessage = await response.text();
        }

        // Tratamento específico para 401 (Token expirado ou inválido)
        if (response.status === 401) {
            console.warn("Sessão expirada ou inválida. Redirecionando...");
            if (typeof window !== "undefined") {
                // Opcional: Limpar storage e redirecionar
                // localStorage.removeItem("token");
                // window.location.href = "/login";
            }
        }

        throw new Error(errorMessage);
      }

      // Sucesso: 204 No Content (retorna null)
      if (response.status === 204) {
        return null as T;
      }

      // Sucesso: Retorna JSON
      return await response.json();

    } catch (error: any) {
      console.error(`[HttpClient] Falha na requisição para ${endpoint}:`, error);
      
      // Opcional: Toast global de erro (cuidado para não spammar)
      // toast({ title: "Erro de Conexão", description: error.message, variant: "destructive" });
      
      throw error; // Re-lança para que o componente possa tratar se quiser
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  public patch<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const httpClient = HttpClient.getInstance();