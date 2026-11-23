import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../api/authService';
import { STORAGE_KEYS } from '../api/config';
import { onlyDigits } from '../utils/validators';

const AuthContext = createContext(null);

/**
 * Fonte única de verdade sobre a sessão do usuário.
 * Qualquer tela consulta `useAuth()` em vez de reler o
 * AsyncStorage ou repetir lógica de login/logout.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaura a sessão salva ao abrir o app.
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.user);
        if (stored) setUser(JSON.parse(stored));
      } catch {
        // Sessão corrompida: segue deslogado, sem quebrar o app.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { token, user: loggedUser } = await authService.login(email, password);

    // setItem/removeItem em vez dos métodos em lote: a v3 do
    // AsyncStorage renomeou multiSet/multiRemove para setMany/removeMany,
    // e os individuais funcionam igual nas duas versões.
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.token, token),
      AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(loggedUser)),
    ]);

    setUser(loggedUser);
    return loggedUser;
  }, []);

  /**
   * Cadastra e já autentica o usuário.
   *
   * O endpoint /auth/register devolve apenas o usuário criado, sem
   * token — então emendamos um login para que a pessoa entre direto
   * no app em vez de ter que digitar as credenciais de novo.
   * Máscaras de CPF e telefone são removidas antes do envio: a UI
   * formata para leitura, a API recebe apenas dígitos.
   */
  const signUp = useCallback(
    async ({ name, email, cpf, phone, password, confirmPassword }) => {
      const normalizedEmail = email.trim();

      await authService.register({
        name: name.trim(),
        email: normalizedEmail,
        cpf: onlyDigits(cpf),
        phone: phone ? onlyDigits(phone) : undefined,
        password,
        confirmPassword,
      });

      return signIn(normalizedEmail, password);
    },
    [signIn],
  );

  const signOut = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.token),
      AsyncStorage.removeItem(STORAGE_KEYS.user),
    ]);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
      isAuthenticated: Boolean(user),
      // Regra de negócio: só ADMIN gerencia o catálogo.
      isAdmin: user?.role === 'ADMIN',
    }),
    [user, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de um AuthProvider.');
  }
  return context;
}