//Redirecionamento do usuário por padrão para /dashboard usando pages router

module.exports = {
  images: {
    domains: ["utfs.io"], // Domínio permitido para imagens (uploadthing)
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
    ]
  },
}
