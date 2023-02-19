import type { User, Game, Invitation } from "../types"
import { createClient } from "@supabase/supabase-js";

export const manageInvites = (socket: any, io: any) => {
  const supabaseUrl = process.env.supabaseURL || "https://vzbajybawyxvajpquaan.supabase.co"
  const supabaseKey = process.env.supabaseKEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YmFqeWJhd3l4dmFqcHF1YWFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3NTM5NzE2NSwiZXhwIjoxOTkwOTczMTY1fQ.NyN1XY4QuwtXhGxIHgCKVX8gqR_b7S4zPShCP7z_MeE"
  const supabaseClient = createClient(supabaseUrl, supabaseKey)

  socket.on("create-user", ({username}: {username: string}) => {
    socket.join(socket.id)
    const newUser : User = {username, id: socket.id}
    supabaseClient.from("User").insert(newUser).then(({data, error}) => {console.log("User Connected", data, error)})
    socket.emit("user-created", newUser)
  })

  socket.on("send-invite", (invitation : Invitation) => {
    
    supabaseClient.from("Invitation").insert(invitation).then(({data, error}) => {
      console.log("recieved invitation", data, error)
      io.to(invitation.recieverId).emit("invitation", invitation)
    })
  })

  socket.on("invitation-accepted", (invitation: Invitation) => {
    const newGame : Game = {
      id: invitation.senderId,
      player1: invitation.senderId,
      player2: invitation.recieverId,
      turn: "player1"
    }

    supabaseClient.from("Game").insert(newGame).then(() => {console.log("Game added to supabase")})
    supabaseClient.from("Invitation").delete().eq("senderId", invitation.senderId).then(() => {console.log("Cleaned up invitations")})
    supabaseClient.from("Invitation").delete().eq("senderId", invitation.recieverId).then(() => {console.log("Cleaned up invitations")})

    if (socket.id !== invitation.senderId){
      socket.join(invitation.senderId)
    }

    socket.on("leave", (roomId: string) => {
      socket.id !== roomId && socket.leave(roomId)
      supabaseClient.from("Game").delete().eq("id", roomId).then(() => { console.log("user left the room") })
    })
    

    io.to(invitation.senderId).emit("game-started", newGame)
  })

  socket.on("invitation-denied", (invitation : Invitation) => {
    supabaseClient.from("Invitation").delete().eq("id", invitation.id).then(() => {socket.emit("invitation-denied", invitation)})
  })

  socket.on("move", ({move, gameId} : { move: (string|number)[], gameId: string }) => {
    io.to(gameId).emit("move", move)
  })

  socket.on("get-user", (id : string) => {
    supabaseClient.from("User").select().eq("id",id).then(({data, error}) => {
      if (error) {
        console.log(error)
      } else {
        socket.emit('user', data?.at(0))
      }
    })
  })

  socket.on("restart-game", (roomId : string) => {
    io.to(roomId).emit("restart-game")
  })

  socket.on("disconnect", () => {
    supabaseClient.from("User").delete().eq("id", socket.id).then(() => {console.log("User disconnected")})
    supabaseClient.from("Invitations").delete().eq("senderId", socket.id).then(() => {console.log("Updated invitations")})
  })

};
