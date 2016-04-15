module Main where

import Prelude (Unit, return, (<$>), (<*>), ($), (<>), unit)

import Data.Maybe
import Data.Array (reverse)
import Data.Either

import Node.Yargs.Setup
import Node.Yargs.Applicative

import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Console (CONSOLE, log, print)
import Control.Monad.Eff.Exception (EXCEPTION())

app :: forall eff. Array String -> Boolean -> Eff (console::CONSOLE | eff) Unit
app [] _ = return unit            -- No-op
app ss false = print ss           -- Not sure...
app ss true = print (reverse ss)  -- Hmm...

main :: forall eff. Eff (console::CONSOLE, err::EXCEPTION | eff) Unit
main = do
  let setup = usage "$0 -w Word1 -w Word2"
              <> example "$0 -w Hello -w World" "Say hello!"
  runY setup $ app <$> yarg "w" ["word"] (Just "A word") (Right "At least one word is required") false
                   <*> flag "r" []       (Just "Reverse the words")