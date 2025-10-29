// Caminho: hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// Uma interface genérica para as informações do usuário que pegamos do localStorage
interface UserInfo {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    role?: string; // O perfil escolhido no login
    specialty?: string;
    department?: string;
  };
  // Adicione outros campos que possam existir
}

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userInfoString = localStorage.getItem('user_info');
    const token = Cookies.get('access_token');

    if (userInfoString && token) {
      try {
        const userInfo = JSON.parse(userInfoString);
        setUser(userInfo);
      } catch (error) {
        console.error("Erro ao parsear user_info do localStorage", error);
        router.push('/'); // Redireciona se os dados estiverem corrompidos
      }
    } else {
      // Se não houver token ou info, redireciona para a página inicial/login
      router.push('/');
    }
  }, [router]);

  return user; // Retorna o usuário logado ou null enquanto carrega/redireciona
}