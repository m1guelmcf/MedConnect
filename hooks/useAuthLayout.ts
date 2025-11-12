// ARQUIVO COMPLETO PARA: hooks/useAuthLayout.ts

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/usersApi.mjs';
import { toast } from "@/hooks/use-toast";

interface UserLayoutData {
  id: string;
  name: string;
  email: string;
  roles: string[];
  avatar_url?: string;
  avatarFullUrl?: string;
}

interface UseAuthLayoutOptions {
  requiredRole?: string;
}

export function useAuthLayout({ requiredRole }: UseAuthLayoutOptions = {}) {
  const [user, setUser] = useState<UserLayoutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const fullUserData = await usersService.getMe();

        if (
          requiredRole &&
          !fullUserData.roles.includes(requiredRole) &&
          !fullUserData.roles.includes('admin')
        ) {
          console.error(`Acesso negado. Requer perfil '${requiredRole}', mas o usuário tem '${fullUserData.roles.join(', ')}'.`);
          toast({
            title: "Acesso Negado",
            description: "Você não tem permissão para acessar esta página.",
            variant: "destructive",
          });
          router.push('/');
          return;
        }

        const avatarPath = fullUserData.profile.avatar_url;
        
        // *** A CORREÇÃO ESTÁ AQUI ***
        // Adicionamos o nome do bucket 'avatars' na URL final.
        const avatarFullUrl = avatarPath 
          ? `https://yuanqfswhberkoevtmfr.supabase.co/storage/v1/object/public/avatars/${avatarPath}` 
          : undefined;

        setUser({
          id: fullUserData.user.id,
          name: fullUserData.profile.full_name || 'Usuário',
          email: fullUserData.user.email,
          roles: fullUserData.roles,
          avatar_url: avatarPath,
          avatarFullUrl: avatarFullUrl,
        });

      } catch (error) {
        console.error("Falha na autenticação do layout:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router, requiredRole]);

  return { user, isLoading };
}