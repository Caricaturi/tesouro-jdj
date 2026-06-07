const { error: authError } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/welcome`
  }
})

setLoading(false)

if (authError) return setError('Erro ao enviar o link. Tente novamente.')
