import { useState, useCallback } from "react";
import type { Member, MensalidadePayment, Avulso, CaixaEntry, Jogo } from "@/types";
import { format } from "date-fns";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {}
  return fallback;
}

function saveToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uuid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useStore() {
  const [members, setMembersState] = useState<Member[]>(() =>
    loadFromStorage("fdc_members", [])
  );
  const [mensalidades, setMensalidadesState] = useState<MensalidadePayment[]>(
    () => loadFromStorage("fdc_mensalidades", [])
  );
  const [avulsos, setAvulsosState] = useState<Avulso[]>(() =>
    loadFromStorage("fdc_avulsos", [])
  );
  const [caixa, setCaixaState] = useState<CaixaEntry[]>(() =>
    loadFromStorage("fdc_caixa", [])
  );
  const [jogos, setJogosState] = useState<Jogo[]>(() =>
    loadFromStorage("fdc_jogos", [])
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    format(new Date(), "yyyy-MM")
  );

  const setMembers = useCallback((v: Member[] | ((prev: Member[]) => Member[])) => {
    setMembersState((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      saveToStorage("fdc_members", next);
      return next;
    });
  }, []);

  const setMensalidades = useCallback(
    (v: MensalidadePayment[] | ((prev: MensalidadePayment[]) => MensalidadePayment[])) => {
      setMensalidadesState((prev) => {
        const next = typeof v === "function" ? v(prev) : v;
        saveToStorage("fdc_mensalidades", next);
        return next;
      });
    },
    []
  );

  const setAvulsos = useCallback((v: Avulso[] | ((prev: Avulso[]) => Avulso[])) => {
    setAvulsosState((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      saveToStorage("fdc_avulsos", next);
      return next;
    });
  }, []);

  const setCaixa = useCallback((v: CaixaEntry[] | ((prev: CaixaEntry[]) => CaixaEntry[])) => {
    setCaixaState((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      saveToStorage("fdc_caixa", next);
      return next;
    });
  }, []);

  const setJogos = useCallback((v: Jogo[] | ((prev: Jogo[]) => Jogo[])) => {
    setJogosState((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      saveToStorage("fdc_jogos", next);
      return next;
    });
  }, []);

  // --- Members ---
  const addMember = useCallback(
    (data: Omit<Member, "id" | "createdAt">) => {
      const member: Member = { ...data, id: uuid(), createdAt: new Date().toISOString() };
      setMembers((prev) => [...prev, member]);
      // ensure mensalidade records exist for all months already used
      return member;
    },
    [setMembers]
  );

  const removeMember = useCallback(
    (id: string) => {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    },
    [setMembers]
  );

  const updateMember = useCallback(
    (id: string, data: Partial<Omit<Member, "id" | "createdAt">>) => {
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...data } : m))
      );
    },
    [setMembers]
  );

  const addMembers = useCallback(
    (list: Omit<Member, "id" | "createdAt">[]) => {
      const newMembers: Member[] = list.map((data) => ({
        ...data,
        id: uuid(),
        createdAt: new Date().toISOString(),
      }));
      setMembers((prev) => [...prev, ...newMembers]);
      return newMembers;
    },
    [setMembers]
  );

  // --- Mensalidades ---
  const getMensalidadeForMonth = useCallback(
    (memberId: string, monthKey: string): MensalidadePayment | undefined => {
      return mensalidades.find((m) => m.memberId === memberId && m.monthKey === monthKey);
    },
    [mensalidades]
  );

  const toggleMensalidade = useCallback(
    (memberId: string, monthKey: string) => {
      const existing = mensalidades.find(
        (m) => m.memberId === memberId && m.monthKey === monthKey
      );
      if (!existing) {
        // create as paid
        const caixaEntry: CaixaEntry = {
          id: uuid(),
          descricao: `Mensalidade ${monthKey}`,
          valor: 20,
          tipo: "mensalidade",
          data: new Date().toISOString(),
          referencia: memberId,
        };
        const payment: MensalidadePayment = {
          id: uuid(),
          memberId,
          monthKey,
          pago: true,
          paidAt: new Date().toISOString(),
          caixaEntryId: caixaEntry.id,
        };
        setCaixa((prev) => [...prev, caixaEntry]);
        setMensalidades((prev) => [...prev, payment]);
      } else if (!existing.pago) {
        // mark as paid
        const caixaEntry: CaixaEntry = {
          id: uuid(),
          descricao: `Mensalidade ${monthKey}`,
          valor: 20,
          tipo: "mensalidade",
          data: new Date().toISOString(),
          referencia: memberId,
        };
        setCaixa((prev) => [...prev, caixaEntry]);
        setMensalidades((prev) =>
          prev.map((m) =>
            m.id === existing.id
              ? { ...m, pago: true, paidAt: new Date().toISOString(), caixaEntryId: caixaEntry.id }
              : m
          )
        );
      } else {
        // mark as unpaid, remove caixa entry
        if (existing.caixaEntryId) {
          setCaixa((prev) => prev.filter((c) => c.id !== existing.caixaEntryId));
        }
        setMensalidades((prev) =>
          prev.map((m) =>
            m.id === existing.id ? { ...m, pago: false, paidAt: undefined, caixaEntryId: undefined } : m
          )
        );
      }
    },
    [mensalidades, setCaixa, setMensalidades]
  );

  // --- Avulsos ---
  const addAvulso = useCallback(
    (data: { nome: string; memberId?: string; dataJogo: string }) => {
      const monthKey = data.dataJogo.slice(0, 7);
      const caixaEntry: CaixaEntry = {
        id: uuid(),
        descricao: `Avulso: ${data.nome} (${data.dataJogo})`,
        valor: 10,
        tipo: "avulso",
        data: new Date().toISOString(),
      };
      const avulso: Avulso = {
        id: uuid(),
        ...data,
        monthKey,
        caixaEntryId: caixaEntry.id,
      };
      caixaEntry.referencia = avulso.id;
      setCaixa((prev) => [...prev, caixaEntry]);
      setAvulsos((prev) => [...prev, avulso]);
    },
    [setCaixa, setAvulsos]
  );

  const removeAvulso = useCallback(
    (id: string) => {
      const avulso = avulsos.find((a) => a.id === id);
      if (avulso?.caixaEntryId) {
        setCaixa((prev) => prev.filter((c) => c.id !== avulso.caixaEntryId));
      }
      setAvulsos((prev) => prev.filter((a) => a.id !== id));
    },
    [avulsos, setCaixa, setAvulsos]
  );

  // --- Caixa ---
  const addDespesa = useCallback(
    (descricao: string, valor: number) => {
      const entry: CaixaEntry = {
        id: uuid(),
        descricao,
        valor: -Math.abs(valor),
        tipo: "despesa",
        data: new Date().toISOString(),
      };
      setCaixa((prev) => [...prev, entry]);
    },
    [setCaixa]
  );

  // --- Jogos (gols) ---
  const addJogo = useCallback(
    (jogo: Omit<Jogo, "id" | "createdAt">) => {
      const newJogo: Jogo = {
        ...jogo,
        id: uuid(),
        createdAt: new Date().toISOString(),
      };
      setJogos((prev) => [...prev, newJogo]);
      return newJogo;
    },
    [setJogos]
  );

  const removeJogo = useCallback(
    (id: string) => {
      setJogos((prev) => prev.filter((j) => j.id !== id));
    },
    [setJogos]
  );

  const saldoCaixa = caixa.reduce((acc, e) => acc + e.valor, 0);
  const totalEntradas = caixa.filter((e) => e.valor > 0).reduce((acc, e) => acc + e.valor, 0);
  const totalSaidas = caixa.filter((e) => e.valor < 0).reduce((acc, e) => acc + Math.abs(e.valor), 0);

  return {
    members,
    mensalidades,
    avulsos,
    caixa,
    jogos,
    selectedMonth,
    setSelectedMonth,
    addMember,
    removeMember,
    updateMember,
    addMembers,
    getMensalidadeForMonth,
    toggleMensalidade,
    addAvulso,
    removeAvulso,
    addDespesa,
    addJogo,
    removeJogo,
    saldoCaixa,
    totalEntradas,
    totalSaidas,
  };
}

export type Store = ReturnType<typeof useStore>;
